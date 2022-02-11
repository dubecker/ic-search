import { BinaryBlob, blobFromText, blobFromUint8Array } from '@dfinity/candid';
import { Principal } from '@dfinity/principal';

import Canister from './canister';
import { textFromPrincipalBlob } from './utils';

const MAX_CANISTERS_PER_SUBNET = 16 ** 5;

export default class Subnet {
    _id: string;
    _subnetInfo = {
        idStart: null,
        idEnd: null,
        // numberIdsTaken: 0,
        // numberActiveCanisters: 0,
        lastIdFound: null,
    };

    _canisters = Array<Canister>();

    constructor(id: string) {
        // construct with human readable string representation
        this._id = id;
    }

    assignCanisterRange(start, end) {
        // assign with blob representation
        this._subnetInfo.idStart = start;
        this._subnetInfo.idEnd = end;
    }

    getNodeIdAsString(): string {
        // return Principal.fromUint8Array(this._id).toText();
        return this._id;
    }

    getCanistersStartIdAsBlob = () => {
        return this._subnetInfo.idStart;
    };

    getCanistersStartIdAsString = () => {
        return textFromPrincipalBlob(this._subnetInfo.idStart);
    };

    getCanistersEndIdAsString = () => {
        return textFromPrincipalBlob(this._subnetInfo.idEnd);
    };

    getNumberOfCanisters = () => {
        return this._canisters.length;
    };

    // setNumberOfOccupiedIds(val: number) {
    //     this._subnetInfo.numberIdsTaken = val;
    // }

    getNumberOfOccupiedIds = () => {
        return (
            Canister.canisterIdToDecimal(
                this.getLatestCanisterId().toUint8Array(),
            ) + 1
        );
    };

    // setNumberOfActiveCanisters(val) {
    //     this._subnetInfo.numberActiveCanisters = val;
    // }

    getNumberOfActiveCanisters = () => {
        // return this._subnetInfo.numberActiveCanisters;
        return this._canisters.length;
    };

    // incrementActiveCanisters = () => {
    //     this._subnetInfo.numberActiveCanisters++;
    // };

    // incrementCanisterIdsTaken = () => {
    //     this._subnetInfo.numberIdsTaken++;
    // };

    setLatestCanisterId(val: Principal) {
        // to avoid pass by reference, create new object to pass by value.
        this._subnetInfo.lastIdFound = val;
    }

    getLatestCanisterId(): Principal {
        // return Canister.incrementCanisterBy(
        //     this.getCanistersStartIdAsBlob(),
        //     this.getNumberOfOccupiedIds(),
        // );
        return this._subnetInfo.lastIdFound
            ? this._subnetInfo.lastIdFound
            : Principal.fromUint8Array(this._subnetInfo.idStart);
    }

    getLatestCanisterIdAsString(): string {
        // return textFromPrincipalBlob(this.getLatestCanisterId());
        return this.getLatestCanisterId().toText();
    }

    fetchAllCanisters = async () => {
        // iterate through all canisters and check if metadata exists. If yes,
        // increment and look for next one.
        let canisterId = this.getLatestCanisterId();
        // let canisterId = Canister.incrementCanisterBy(
        //     this.getCanistersStartIdAsBlob(),
        //     16 ** 5 - 1,
        // );
        let iter = 0;
        let notFound = 0;
        while (true) {
            if (++iter > MAX_CANISTERS_PER_SUBNET) {
                // break to avoid running more than maximum number of allowed canister ids
                console.log(
                    'Reached max. number of canisters per subnet. Stopping.',
                );
                break;
            } else if (notFound > 100) {
                // break to stop if no new canisters are found for a while
                console.log(
                    '\nNo more canisters found. Stopping at # ' +
                        (
                            Canister.canisterIdToDecimal(
                                this.getLatestCanisterId().toUint8Array(),
                            ) + 1
                        ).toString() +
                        '. Found ' +
                        this.getNumberOfActiveCanisters().toString() +
                        '.',
                );
                break;
            }
            if (iter > 100000) {
                break;
            }
            let canister = new Canister(
                // Principal.fromUint8Array(canisterId).toText(),
                canisterId.toText(),
            );
            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
            process.stdout.write(
                'Parsing canister (' +
                    iter.toString() +
                    '): ' +
                    canister.getCanisterIdAsString(),
            );
            // certain canisters dont have metadata but are still relevant. Ignore these
            if (canister.isSpecialCanister()) {
                canister.initialize(null, null, 'Special', null);
                // canisterId = await Canister.incrementCanister(canisterId);
            }
            // fetch metadata of canisters, if one is found, returns true, else no further canisters exist and stop
            if (!(await canister.fetchCanisterInfo())) {
                break;
            }
            // if controller is assigned, canister is active. Otherwise ignore
            if (canister.getController() || canister.getModuleHash()) {
                this._canisters.push(canister);
                // console.log('\n', this.getLatestCanisterId());
                this.setLatestCanisterId(canisterId); // pass by value
                // console.log('\n', this.getLatestCanisterId());
                notFound = 0;
            }
            notFound++;
            canisterId = Principal.fromUint8Array(
                Canister.incrementCanister(canisterId.toUint8Array()),
            ); // pass by reference
            // console.log('\n', this.getLatestCanisterIdAsString());
            // console.log('\n', this.getLatestCanisterId());
            // break;
        }
        // console.log(textFromPrincipalBlob(this.getLatestCanisterId()));
        process.stdout.write('\n');
    };

    printInfo() {
        let s = {subnet: this.getNodeIdAsString()};
        return s;
    }

    exportObject(includeCanisters: boolean = true) {
        let info = {
            idStart: this.getCanistersStartIdAsString(),
            idEnd: this.getCanistersEndIdAsString(),
            idLatest: this.getLatestCanisterIdAsString(),
            idsTaken: this.getNumberOfOccupiedIds(),
            idsActive: this.getNumberOfActiveCanisters(),
        };
        let output = {
            id: this.getNodeIdAsString(),
            subnetInfo: info,
        };
        if (includeCanisters) {
            let tmp = [];
            if (this.getNumberOfCanisters() > 0) {
                for (let canister of this._canisters) {
                    tmp.push(canister.exportObject());
                }
            } else {
                tmp = [''];
            }
            output['canisters'] = tmp;
        }
        return output;
    }

    exportSummary() {}
}
