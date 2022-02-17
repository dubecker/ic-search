import borc from 'borc';
import fetch from 'node-fetch';
import _ from 'underscore';

import { Actor, Certificate, HttpAgent } from '@dfinity/agent';
import { BinaryBlob, blobFromText, blobFromUint8Array } from '@dfinity/candid';
import { Principal } from '@dfinity/principal';

import { CanisterExport } from './types';
import { getCandidHack_interface, textFromPrincipalBlob } from './utils';

global.fetch = fetch;

const decoder = new borc.Decoder({
    tags: {
        55799: (val) => val,
    },
});

const icAgent = new HttpAgent({host: 'https://ic0.app'});

export default class Canister {
    _id: Principal;
    _controllers: [string];
    _module_hash: string;
    _type: string;
    _subnet: string;

    _did: string = '';

    constructor(id: Principal) {
        this._id = id;
    }

    initialize = (
        controllers: [string],
        module_hash: string,
        type: string,
        subnet: string,
    ) => {
        this.setController(controllers);
        this.setModuleHash(module_hash);
        this.setType(type);
        this.setSubnet(subnet);
    };

    setController(controllers: [string]) {
        this._controllers = controllers;
    }

    getController(): [string] {
        return this._controllers;
    }

    setModuleHash(h: string) {
        this._module_hash = h;
    }

    getModuleHash(): string {
        return this._module_hash;
    }

    setSubnet(s: string) {
        this._subnet = s;
    }

    getSubnet(): string {
        return this._subnet;
    }

    setType(type: string) {
        this._type = type;
    }

    getType(): string {
        return this._type;
    }

    getCanisterId(): Principal {
        return this._id;
    }

    getCanisterIdAsBlob(): BinaryBlob {
        return blobFromUint8Array(this._id.toUint8Array());
    }

    getCanisterIdAsString(): string {
        return this._id.toText();
    }

    public async fetchCanisterInfo(agent: HttpAgent = icAgent) {
        let canisterId = this.getCanisterIdAsString();

        let principal = this.getCanisterIdAsBlob();

        let pathCommon = [blobFromText('canister'), principal];
        let pathModuleHash = pathCommon.concat(blobFromText('module_hash'));
        let pathControllers = pathCommon.concat(blobFromText('controllers'));
        let readState;
        try {
            // this will fail if no canister with the define ID exists
            readState = await agent.readState(canisterId, {
                paths: [pathModuleHash, pathControllers],
            });
        } catch (e) {
            return false;
        }
        let cert = new Certificate(readState, agent);

        if (await cert.verify()) {
            // delegation
            let subnet = cert['cert'].delegation
                ? textFromPrincipalBlob(cert['cert'].delegation.subnet_id)
                : null;

            // type, NNS canisters have no delegation (i.e. subnet) defined,
            // all others do.
            let type: string = subnet ? 'Application' : 'NNS';

            // get module hash
            let module_hash = cert.lookup(pathModuleHash);
            let array = new Uint8Array(module_hash);
            let moduleHash = '';
            for (var i = 0; i < array.length; i++) {
                moduleHash += array[i].toString(16);
            }

            // get controllers
            let controllers = cert.lookup(pathControllers);
            let controllerId: [string] = controllers
                ? decoder
                      .decodeFirst(controllers)
                      .map((buf) => Principal.fromUint8Array(buf).toText())
                : null;

            // initialize canister
            this.initialize(controllerId, moduleHash, type, subnet);
        } else {
            throw new Error('cert verify failed');
        }
        return true;
    }

    public async fetchCandid(agent: HttpAgent = icAgent): Promise<boolean> {
        if (this.getType() == 'NNS') {
            // skip NNS canisters
            // console.log(
            //     'Cannot fetch candid from NNS canister. Canister',
            //     this.getCanisterIdAsString(),
            //     'skipped.',
            // );
            return false;
        } else if (!this.getModuleHash()) {
            // skip empty canisters
            // console.log(
            //     'No module hash found. Canister',
            //     this.getCanisterIdAsString(),
            //     'skipped.',
            // );
            return false;
        } else {
            try {
                let did = await Actor.createActor(getCandidHack_interface, {
                    agent,
                    canisterId: this.getCanisterId(),
                }).__get_candid_interface_tmp_hack();
                this._did = did as string;
                return true;
            } catch (e) {
                // console.log(e.result.reject_message);
                return false;
            }
        }
    }

    exportObject(): CanisterExport {
        return {
            id: this.getCanisterIdAsString(),
            controller: this.getController(),
            module_hash: this.getModuleHash(),
            type: this.getType(),
        };
    }

    exportCandid() {
        return this._did as string;
    }
}
