import { BinaryBlob, blobFromText, blobFromUint8Array } from '@dfinity/candid';
import { Principal } from '@dfinity/principal';

import Canister from './canister';
import { CanisterExport, SubnetExport } from './types';
import {
	canisterIdToDecimal,
	incrementPrincipal,
	textFromPrincipalBlob,
} from './utils';

const MAX_CANISTERS_PER_SUBNET = 16 ** 5;

const NOT_FOUND_TIMEOUT = 100; // number of times a new canister is searched for until it is certain that there are no new ones

export default class Subnet {
    // _id: string;
    _id: Principal;
    _subnetInfo = {
        canisterIdStart: null as Principal,
        canisterIdEnd: null as Principal,
        // numberIdsTaken: 0,
        // numberActiveCanisters: 0,
        // lastCanisterIdFound: null,
        nextCanisterIdAvailable: null as Principal,
    };

    _canisters = Array<Canister>();

    // constructor(id: string) {
    constructor(id: Principal) {
        // construct with human readable string representation
        this._id = id;
    }

    assignCanisterRange(start: Principal, end: Principal) {
        // assign with blob representation
        this._subnetInfo.canisterIdStart = start;
        this._subnetInfo.canisterIdEnd = end;

        let tmp = start.toText();
        this._subnetInfo.nextCanisterIdAvailable = Principal.fromText(tmp);
    }

    getNodeIdAsString(): string {
        // return Principal.fromUint8Array(this._id).toText();
        // return this._id;
        return this._id.toText();
    }

    getCanistersStartIdAsBlob = () => {
        return this._subnetInfo.canisterIdStart;
    };

    getCanistersStartIdAsString(): string {
        return this._subnetInfo.canisterIdStart.toText();
    }

    getCanistersEndIdAsString(): string {
        return this._subnetInfo.canisterIdEnd.toText();
    }

    getNumberOfCanisters = () => {
        return this._canisters.length;
    };

    // setNumberOfOccupiedIds(val: number) {
    //     this._subnetInfo.numberIdsTaken = val;
    // }

    getNumberOfOccupiedIds = () => {
        return canisterIdToDecimal(
            this.getNextCanisterIdAvailable().toUint8Array(),
        );
    };

    getNumberOfActiveCanisters = () => {
        // return this._subnetInfo.numberActiveCanisters;
        return this._canisters.length;
    };

    setNextCanisterIdAvailable(val: Principal) {
        // to avoid pass by reference, create new object to pass by value.
        this._subnetInfo.nextCanisterIdAvailable = val;
    }

    getNextCanisterIdAvailable(): Principal {
        // return Canister.incrementCanisterBy(
        //     this.getCanistersStartIdAsBlob(),
        //     this.getNumberOfOccupiedIds(),
        // );
        return this._subnetInfo.nextCanisterIdAvailable
            ? this._subnetInfo.nextCanisterIdAvailable
            : this._subnetInfo.canisterIdStart;
        // : Principal.fromUint8Array(this._subnetInfo.canisterIdStart);
    }

    getNextCanisterIdAvailableAsString(): string {
        // return textFromPrincipalBlob(this.getLatestCanisterId());
        return this.getNextCanisterIdAvailable().toText();
    }

    fetchAllCanisters = async () => {
        // iterate through all canisters and check if metadata exists. If yes,
        // increment and look for next one.
        let nextCanisterId = this.getNextCanisterIdAvailable();
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
            } else if (notFound > NOT_FOUND_TIMEOUT) {
                // break to stop if no new canisters are found for a while
                console.log(
                    '\nNo more canisters found. Stopping at # ' +
                        canisterIdToDecimal(
                            this.getNextCanisterIdAvailable().toUint8Array(),
                        ).toString() +
                        '. Found ' +
                        this.getNumberOfActiveCanisters().toString() +
                        '.',
                );
                break;
            }
            if (iter > 10000) {
                break;
            }
            let tmp = nextCanisterId.toText();
            let canister = new Canister(
                // Principal.fromUint8Array(canisterId).toText(),
                // canisterId.toText(),
                // Principal.fromText(canisterId),
                Principal.fromText(tmp),
            );
            // console.log(canister.getCanisterIdAsString());
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
                // this.setLatestCanisterId(Principal.fromText(canisterId));
                // this.setNextCanisterIdAvailable(nextCanisterId);
                notFound = 0;
            }
            notFound++;
            // canisterId = incrementPrincipal(
            //     Principal.fromText(canisterId),
            // ).toText();
            nextCanisterId = incrementPrincipal(nextCanisterId);
        }
        // console.log(textFromPrincipalBlob(this.getLatestCanisterId()));
        process.stdout.write('\n');
    };

    printInfo() {
        let s = {subnet: this.getNodeIdAsString()};
        return s;
    }

    exportObject(includeCanisters: boolean = true): SubnetExport {
        let output = {} as SubnetExport;
        let info = {
            canisterIdStart: this.getCanistersStartIdAsString(),
            canisterIdEnd: this.getCanistersEndIdAsString(),
            canisterIdNext: this.getNextCanisterIdAvailableAsString(),
            canisterIdsTaken: this.getNumberOfOccupiedIds(),
            canisterIdsActive: this.getNumberOfActiveCanisters(),
        };
        // let output = {
        //     id: this.getNodeIdAsString(),
        //     subnetInfo: info,
        // };
        output.id = this.getNodeIdAsString();
        output.subnetInfo = info;
        if (includeCanisters) {
            // let tmp = {} as [CanisterExport];
            let tmp: CanisterExport[] = [];
            // let tmp = [];
            if (this.getNumberOfCanisters() > 0) {
                for (let canister of this._canisters) {
                    tmp.push(canister.exportObject());
                }
            } else {
                // tmp = [];
            }
            output.canisters = tmp;
        }
        return output;
    }

    exportSummary() {}
}
