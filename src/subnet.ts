import { BinaryBlob, blobFromText, blobFromUint8Array } from '@dfinity/candid';
import { Principal } from '@dfinity/principal';

import Canister from './canister';
import { CanisterExport, SubnetExport } from './types';
import { canisterIdToDecimal, incrementPrincipal } from './utils';

const MAX_CANISTERS_PER_SUBNET = 16 ** 5;

const NOT_FOUND_LIMIT = 100; // number of times a new canister is searched for until it is certain that there are no new ones

export default class Subnet {
    _id: Principal;
    _subnetInfo = {
        canisterIdStart: null as Principal,
        canisterIdEnd: null as Principal,
    };

    _canisters = Array<Canister>();

    constructor(id: Principal) {
        this._id = id;
    }

    assignCanisterRange(start: Principal, end: Principal) {
        this._subnetInfo.canisterIdStart = start;
        this._subnetInfo.canisterIdEnd = end;
    }

    getNodeIdAsString(): string {
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

    getNumberOfOccupiedIds(): number {
        return canisterIdToDecimal(this.findNextAvailableCanisterId());
    }

    getNumberOfActiveCanisters = () => {
        return this._canisters.length;
    };

    findNextAvailableCanisterId(): Principal {
        // get the lastest canister ID + 1 that was found. Go through canister list and sort by decimal order.
        // pick highest one.
        if (this._canisters.length > 0) {
            const decimalCanisterIds = this._canisters.map((x) =>
                canisterIdToDecimal(x.getCanisterId()),
            );
            const indexOfMax = decimalCanisterIds.indexOf(
                Math.max(...decimalCanisterIds),
            );
            const cId = this._canisters[indexOfMax].getCanisterId();
            return incrementPrincipal(cId) as Principal;
        } else {
            return this._subnetInfo.canisterIdStart;
        }
    }

    fetchAllCanisters = async () => {
        // iterate through all canisters and check if metadata exists. If yes,
        // increment and look for next one.
        let canisterId = this.findNextAvailableCanisterId().toText();
        let iter = 0;
        let notFound = 0;
        while (true) {
            if (++iter > MAX_CANISTERS_PER_SUBNET) {
                // break to avoid running more than maximum number of allowed canister ids
                console.log(
                    'Reached max. number of canisters per subnet. Stopping.',
                );
                break;
            } else if (notFound > NOT_FOUND_LIMIT) {
                // break to stop if no new canisters are found for a while
                console.log(
                    '\nNo more canisters found. Stopping at # ' +
                        (
                            canisterIdToDecimal(
                                this.findNextAvailableCanisterId(),
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
            let canister = new Canister(Principal.fromText(canisterId));
            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
            process.stdout.write(
                'Parsing canister (' +
                    iter.toString() +
                    '): ' +
                    canister.getCanisterIdAsString(),
            );
            // fetch metadata of canisters, if returns false, an error may have occured during loading, stop
            await canister.fetchCanisterInfo();

            // if controller is assigned, canister is active. Otherwise ignore
            canisterId = incrementPrincipal(canisterId) as string;
            if (canister.getController() || canister.getModuleHash()) {
                this._canisters.push(canister);
                notFound = 0;
                continue;
            }
            notFound++;
        }
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
            canisterIdsTaken: this.getNumberOfOccupiedIds(),
            canisterIdsActive: this.getNumberOfActiveCanisters(),
        };
        output.id = this.getNodeIdAsString();
        output.subnetInfo = info;
        if (includeCanisters) {
            let tmp: CanisterExport[] = [];
            if (this.getNumberOfCanisters() > 0) {
                for (let canister of this._canisters) {
                    tmp.push(canister.exportObject());
                }
            }
            output.canisters = tmp;
        }
        return output;
    }

    exportSummary() {}
}
