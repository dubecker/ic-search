import fs from 'fs';
import path from 'path';
import protobuf, { types } from 'protobufjs';

import { Actor, HttpAgent } from '@dfinity/agent';
import { blobFromUint8Array, IDL } from '@dfinity/candid';
import { Principal } from '@dfinity/principal';

import extendProtobuf from './agent-pb';
import Canister from './canister';
import Subnet from './subnet';
import { ProtoBufMessage, RoutingTableResponse, SubnetExport } from './types';
import { asyncCallWithTimeout, getCurrentDate } from './utils';

const root = protobuf.Root.fromJSON(require('../ic/bundle.json'));

const agent = new HttpAgent({host: 'https://ic0.app'});
const EXPORT_DIR = 'export';

export default class Crawler {
    _subnets = Array<Subnet>();
    private _enableExport: boolean = false;
    private _outputDir: string;

    constructor() {}

    set enableExport(enable: boolean) {
        this._enableExport = enable;
    }

    set outputDir(dir: string) {
        this._outputDir = dir;
    }

    get enableExport(): boolean {
        return this._enableExport;
    }

    get outputDir(): string {
        return this._outputDir;
    }

    fetchAllSubnets = async () => {
        const registry = Actor.createActor(() => IDL.Service({}), {
            agent,
            canisterId: 'rwlgt-iiaaa-aaaaa-aaaaa-cai',
        });
        extendProtobuf(registry, root.lookupService('Registry'));
        let routingTableResponse: RoutingTableResponse =
            await registry.get_value({
                key: Buffer.from('routing_table'),
            });
        let output: ProtoBufMessage = root
            .lookupType('RoutingTable')
            .decode(routingTableResponse.value);
        let subnetArray = [];
        for (let value of output.entries) {
            let subnet = new Subnet(
                Principal.fromUint8Array(value.subnetId.principalId.raw),
            );
            subnet.assignCanisterRange(
                Principal.fromUint8Array(
                    value.range.startCanisterId.principalId.raw,
                ),
                Principal.fromUint8Array(
                    value.range.endCanisterId.principalId.raw,
                ),
            );
            subnetArray.push(subnet);
        }
        this._subnets = subnetArray;
    };

    parseAllSubnets = async () => {
        let iter = 0;
        for (let subnet of this._subnets) {
            process.stdout.write(
                '\n' + 'Parsing subnet: ' + subnet.getNodeIdAsString() + '\n',
            );
            await subnet.fetchAllCanisters();
            this.enableExport ? await this.exportSubnetToFile(subnet) : null;
            if (++iter > 99) {
                // for testing purposes
                break;
            }
        }
    };

    async exportObject(includeCanisters: boolean = true) {
        let tmp = [];
        for (let subnet of this._subnets) {
            tmp.push(subnet.exportObject(includeCanisters));
        }
        return {subnets: tmp};
    }

    printNetwork = async () => {
        for (let subnet of this._subnets) {
            console.log(subnet.exportObject(false));
        }
    };

    exportNetworkInfoToFile = async () => {
        let data = await this.exportObject(false);
        this.writeToFile(JSON.stringify(data), this.outputDir, '_info.json');
    };

    exportSubnetToFile = async (s: Subnet) => {
        if (!this.enableExport) {
            return;
        }
        let data = s.exportObject();
        let dataString = JSON.stringify(data);
        let fileName = s.getNodeIdAsString() + '.json';
        await this.writeToFile(dataString, this.outputDir, fileName);
    };

    async exportCandidToFile(s: Subnet, c: Canister) {
        if (!this.enableExport || !c.hasCandidDefined()) {
            return;
        }
        let dataString = c.exportCandid();
        let outputDir = path.join(this.outputDir, 'did', s.getNodeIdAsString());
        let fileName = c.getCanisterIdAsString() + '.txt';
        await this.writeToFile(dataString, outputDir, fileName);
    }

    initializeExport = () => {
        this.enableExport = true;
        this.outputDir = path.join(EXPORT_DIR, getCurrentDate());
    };

    writeToFile = async (data: string, dir: string, fileName: string) => {
        fs.mkdirSync(dir, {recursive: true});
        let filePath = path.join(dir, fileName);
        fs.writeFile(filePath, data, function (err) {
            if (err) {
                console.log(err);
            }
        });
    };

    listAllCanisters(): string[] {
        let list: Array<string> = [];
        for (let s of this._subnets) {
            list = list.concat(s.getCanistersList());
        }
        return list;
    }

    listLoadedCandids(): string[] {
        let latestDir = this.getLatestDir();
        let didPath = path.join(latestDir, 'did');
        let candidFiles = this.throughDirectory(didPath);
        var filename = candidFiles.map((x) => path.parse(x).name);
        return filename;
    }

    throughDirectory(dir: string): string[] {
        let list: string[] = [];
        if (fs.existsSync(dir)) {
            let files = fs.readdirSync(dir);
            for (let f of files) {
                const Absolute = path.join(dir, f);
                if (fs.statSync(Absolute).isDirectory())
                    list = list.concat(this.throughDirectory(Absolute));
                else {
                    list = list.concat(Absolute);
                }
            }
        }
        return list;
    }

    async crawlNetwork(initFromFile: boolean = true) {
        // freshly load all subnet info from registry
        await this.fetchAllSubnets();
        // load canister info for subnets from file if specified
        if (initFromFile) {
            this.initializeSubnetsFromFile();
        }
        // parse all subnets and look for new canisters within
        await this.parseAllSubnets();
        // export all data to file structure
        await this.exportNetworkInfoToFile();

        console.log('Crawler finsihed successfully.');
    }

    async crawlCandid(initialize: boolean = true) {
        if (initialize) {
            // freshly load all subnet info from registry
            await this.fetchAllSubnets();
            // load canister info for subnets from file if specified
            this.initializeSubnetsFromFile();
            // rewrite network info to new folder location as no new information are gather in this method
            for (let s of this._subnets) {
                await this.exportSubnetToFile(s);
            }
        }

        let i = 0;
        let o = 0;
        let timeoutCounter = 0;
        for (let s of this._subnets) {
            ++i;
            o = 0;
            for (let c of s._canisters) {
                process.stdout.clearLine(0);
                process.stdout.cursorTo(0);
                process.stdout.write(
                    'Getting Candid of canister ' +
                        (++o).toString() +
                        '/' +
                        s.getNumberOfCanisters() +
                        ' on subnet ' +
                        i.toString() +
                        '/' +
                        this._subnets.length +
                        '. Timouts: ' +
                        timeoutCounter.toString() +
                        '.',
                );
                if (!c.hasCandidDefined()) {
                    // await c.fetchCandid();
                    try {
                        await asyncCallWithTimeout(c.fetchCandid(), 10000);
                    } catch (e) {
                        // information should be added to some log file TODO
                        timeoutCounter++;
                        console.log(
                            '\n',
                            'Canister',
                            c.getCanisterIdAsString(),
                            'timed out while fetching Candid.',
                        );
                    }
                }
                await this.exportCandidToFile(s, c);
            }
        }
    }

    async run() {
        this.initializeExport();
        await this.crawlNetwork();
        await this.crawlCandid(false);
    }

    printCandid() {
        let s = this._subnets[1];
        for (let c of s._canisters) {
            console.log(c.getCanisterIdAsString(), ':', c.exportCandid(), '\n');
        }
    }

    getLatestDir(): string {
        if (!fs.existsSync(EXPORT_DIR)) {
            fs.mkdirSync(EXPORT_DIR);
        }
        let latestDate = fs.readdirSync(EXPORT_DIR).sort(() => -1)[0];
        if (latestDate) {
            return path.join(EXPORT_DIR, latestDate);
        } else {
            return '';
        }
    }

    lookupCandid(canister: Canister, fileList: string[]): string {
        let cid = canister.getCanisterIdAsString();
        let filenames = fileList.map((x) => path.parse(x).name);
        let ind = filenames.indexOf(cid);
        if (ind >= 0) {
            let did = fs.readFileSync(fileList[ind]).toString();
            // remove found file from list to make code faster for later iterations
            fileList.splice(ind, 1);
            return did;
        } else {
            return undefined;
        }
    }

    async initializeSubnetsFromFile() {
        let latestDir = this.getLatestDir();
        // get list of subnet files
        let storedFiles = fs.readdirSync(latestDir);
        // get list of did files
        let candidFiles = this.throughDirectory(path.join(latestDir, 'did'));

        for (let subnet of this._subnets) {
            // check if file for subnet exists. If yes, load & initialize
            let subnetFile = subnet.getNodeIdAsString() + '.json';
            if (storedFiles.includes(subnetFile)) {
                console.log(
                    'Initializing',
                    subnet.getNodeIdAsString(),
                    'from file.',
                );
                let subnetStored: SubnetExport = require(path.join(
                    '../',
                    latestDir,
                    subnetFile,
                ));

                // initialize canister list
                for (let c of subnetStored.canisters) {
                    let canister = new Canister(Principal.fromText(c.id));
                    canister.initialize(
                        c.controller,
                        c.module_hash,
                        c.type,
                        subnet.getNodeIdAsString(),
                    );
                    canister.setCandid(
                        this.lookupCandid(canister, candidFiles),
                    );
                    subnet._canisters.push(canister);
                }
            }
        }
    }
}
