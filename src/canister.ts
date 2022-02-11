import borc from 'borc';
// import crypto from 'isomorphic-webcrypto';
import fetch from 'node-fetch';
import _ from 'underscore';

import { Actor, Certificate, HttpAgent } from '@dfinity/agent';
import { BinaryBlob, blobFromText, blobFromUint8Array } from '@dfinity/candid';
import { Principal } from '@dfinity/principal';

import { getCandidHack_interface, textFromPrincipalBlob } from './utils';

global.fetch = fetch;

const decoder = new borc.Decoder({
    tags: {
        55799: (val) => val,
    },
});

const CANISTER_EXCEPTIONS = ['aaaaa-aa'];
const CANDID_UI_CANISTER_ID = 'a4gq6-oaaaa-aaaab-qaa4q-cai';
const CANLISTA_CANISTER_ID = 'kyhgh-oyaaa-aaaae-qaaha-cai';

const icAgent = new HttpAgent({host: 'https://ic0.app'});

export default class Canister {
    _id: string;
    _controllers: string;
    _module_hash: string;
    _type: string;
    _subnet: string;

    constructor(id) {
        // construct with human readable text representation
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

    setController = (controllers) => {
        // construct with human readable text representation
        this._controllers = controllers;
    };

    getController = () => {
        return this._controllers;
    };

    setModuleHash = (h) => {
        this._module_hash = h;
    };

    getModuleHash = () => {
        return this._module_hash;
    };

    setSubnet = (s) => {
        this._subnet = s;
    };

    getSubnet = () => {
        return this._subnet;
    };

    setType = (type) => {
        this._type = type;
    };

    getType = () => {
        return this._type;
    };

    getCanisterIdAsBlob(): BinaryBlob {
        // return this._id;
        return blobFromUint8Array(Principal.fromText(this._id).toUint8Array());
    }

    getCanisterIdAsString = () => {
        // return Principal.fromUint8Array(this._id).toText();
        return this._id;
    };

    isSpecialCanister = () => {
        return _.contains(CANISTER_EXCEPTIONS, this.getCanisterIdAsString());
    };

    static incrementCanister(canisterId) {
        for (let i = canisterId.length - 3; i >= 0; i--) {
            let id = canisterId[i] + 1;
            canisterId[i] = id;
            if (id > 255) {
                // increment next byte as well if 255 is exceeded, else stop
                continue;
            }
            break;
        }
        return canisterId;
    }

    static incrementCanisterBy(
        canisterId: BinaryBlob,
        incr: number,
    ): BinaryBlob {
        for (let i = 0; i < incr; ++i) {
            canisterId = Canister.incrementCanister(canisterId);
        }
        return canisterId;
    }

    static calculateDifference(var1: BinaryBlob, var2: BinaryBlob): number {
        return 0;
    }

    static canisterIdToDecimal(val) {
        // Canister id ranges from 0 to 16**5-1.
        // Buffer bytes 5,6,7 are the id counter of the canister.
        // Of byte 5, only the second hexadecimal digit is part of the id.
        // The first hex digit is counting up with each subnet.
        return (val[5] & 15) * 256 ** 2 + val[6] * 256 + val[7];
    }

    fetchCanisterInfo = async (agent = icAgent) => {
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
        // console.log(cert);
        if (await cert.verify()) {
            // delegation
            let subnet = cert['cert'].delegation
                ? textFromPrincipalBlob(cert['cert'].delegation.subnet_id)
                : null;

            // type, NNS canisters have no delegation (i.e. subnet) defined,
            // all others do.
            let type = subnet ? 'Application' : 'NNS';

            // get module hash
            let module_hash = cert.lookup(pathModuleHash);
            let array = new Uint8Array(module_hash);
            let moduleHash = '';
            for (var i = 0; i < array.length; i++) {
                moduleHash += array[i].toString(16);
            }

            // get controllers
            let controllers = cert.lookup(pathControllers);
            let controllerId = controllers
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
    };

    // ToDo
    /*
    getCandid = async (agent = icAgent) => {
        //, method_name, msg, isReply) {
        canister_id = this.getCanisterIdAsBlob();
        try {
            var did;
            var msg;
            var method_name = 'test';
            var isReply = true;
            // Try fetch i using __get_candid_interface_tmp_hack.
            try {
                did = await Actor.createActor(getCandidHack_interface, {
                    agent,
                    canisterId: canister_id,
                }).__get_candid_interface_tmp_hack();
            } catch (e) {
                console.log(e);
            }
            if (!did) {
                // Try fetch i from canlista kyhgh-oyaaa-aaaae-qaaha-cai
                try {
                    did = await Actor.createActor(getCandid_interface, {
                        agent,
                        canisterId: CANLISTA_CANISTER_ID,
                    }).getCandid(Principal.fromText(canister_id));
                } catch (e) {
                    console.log(e);
                }
                if (did.ok) {
                    did = did.ok.did;
                } else {
                    did = null;
                }
            }
        } catch (err) {
            console.log(err);
        }
        return did;
    };*/

    exportObject = () => {
        return {
            id: this.getCanisterIdAsString(),
            controller: this.getController(),
            module_hash: this.getModuleHash(),
            type: this.getType(),
        };
    };
}
