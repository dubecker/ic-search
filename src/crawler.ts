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
import { getCurrentDate } from './utils';

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

    exportSubnetToFile = async (s) => {
        let data = await s.exportObject();
        let dataString = JSON.stringify(data);
        let fileName = s.getNodeIdAsString() + '.json';
        await this.writeToFile(dataString, this.outputDir, fileName);
        // }
    };

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
        console.log('File', fileName, 'written successfully.');
    };

    async run(initFromFile: boolean = true) {
        // freshly load all subnet info from registry
        await this.fetchAllSubnets();
        // load canister info for subnets from file if specified
        if (initFromFile) {
            this.initializeFromFile();
        }
        // parse all subnets and look for new canisters within
        await this.parseAllSubnets();
        // export all data to file structure
        await this.exportNetworkInfoToFile();

        console.log('Crawler finsihed successfully.');
    }

    async initializeFromFile() {
        let latestDate = fs.readdirSync(EXPORT_DIR).sort(() => -1)[0];
        let latestDir = path.join(EXPORT_DIR, latestDate);
        let storedFiles = fs.readdirSync(latestDir);

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
                    subnet._canisters.push(canister);
                }
            }
        }
    }
}
