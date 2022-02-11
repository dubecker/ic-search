import fs from 'fs';
import path from 'path';
import protobuf, { types } from 'protobufjs';

import { Actor, HttpAgent } from '@dfinity/agent';
import { blobFromUint8Array, IDL } from '@dfinity/candid';
import { Principal } from '@dfinity/principal';

// import extendProtobuf from '../lib';
import extendProtobuf from './agent-pb';
import Canister from './canister';
import Subnet from './subnet';
import { ProtoBufMessage, RoutingTableResponse, SubnetExport } from './types';
import { blobFromPrincipalString, getCurrentDate } from './utils';

// import root from protobuf.Root.fromJSON(require('./bundle.json'));
// const bundle = require('../ic/bundle.json');
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
                Principal.fromUint8Array(
                    value.subnetId.principalId.raw,
                ).toText(),
            );
            subnet.assignCanisterRange(
                value.range.startCanisterId.principalId.raw,
                value.range.endCanisterId.principalId.raw,
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
            // await this.exportSubnetToFile(subnet);
            if (++iter > 99) {
                // for testing purposes
                break;
            }
            // break;
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
        // let tmp = await this.exportObject();
        // console.log(tmp);
        // console.log(JSON.stringify(tmp));
        for (let subnet of this._subnets) {
            console.log(subnet.exportObject(false));
        }
    };

    exportNetworkInfoToFile = async () => {
        // let dir = path.join('export', 'test');
        let data = await this.exportObject(false);
        this.writeToFile(JSON.stringify(data), this.outputDir, '_info.json');
    };

    exportSubnetToFile = async (s) => {
        // if (this.enableExport) {
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
        // if initialized from file, script assumes that there have been no new subnets added since last run.
        // Needs to be improved..
        await this.fetchAllSubnets();

        if (initFromFile) {
            this.initializeFromFile();
        }

        await this.parseAllSubnets();
        await this.exportNetworkInfoToFile();

        console.log('Crawler finsihed successfully.');
    }

    async initializeFromFile() {
        let latestDate = fs.readdirSync(EXPORT_DIR).sort(() => -1)[0];
        // let d = files;
        let latestDir = path.join(EXPORT_DIR, latestDate);

        let storedFiles = fs.readdirSync(latestDir);

        for (let subnet of this._subnets) {
            // check if file for subnet exists. If yes, load & initialize
            let subnetFile = subnet._id + '.json';
            if (storedFiles.includes(subnetFile)) {
                console.log('Initializing', subnet._id, 'from file.');
                let subnetStored: SubnetExport = require(path.join(
                    '../',
                    latestDir,
                    subnetFile,
                ));
                // initialize information
                subnet.setLatestCanisterId(
                    Principal.fromText(subnetStored.subnetInfo.idLatest),
                );
                // subnet.setNumberOfActiveCanisters(
                //     subnetStored.subnetInfo.idsActive,
                // );
                // subnet.setNumberOfOccupiedIds(subnetStored.subnetInfo.idsTaken);

                // initialize canister list
                for (let c of subnetStored.canisters) {
                    let canister = new Canister(c.id);
                    canister.initialize(
                        c.controller,
                        c.module_hash,
                        c.type,
                        subnet._id,
                    );
                    subnet._canisters.push(canister);
                }
            }
        }
    }
}
