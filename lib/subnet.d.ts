import { Principal } from '@dfinity/principal';
import Canister from './canister';
import { SubnetExport } from './types';
export default class Subnet {
    _id: Principal;
    _subnetInfo: {
        canisterIdStart: Principal;
        canisterIdEnd: Principal;
        nextCanisterIdAvailable: Principal;
    };
    _canisters: Canister[];
    constructor(id: Principal);
    assignCanisterRange(start: Principal, end: Principal): void;
    getNodeIdAsString(): string;
    getCanistersStartIdAsBlob: () => Principal;
    getCanistersStartIdAsString(): string;
    getCanistersEndIdAsString(): string;
    getNumberOfCanisters: () => number;
    getNumberOfOccupiedIds: () => any;
    getNumberOfActiveCanisters: () => number;
    setNextCanisterIdAvailable(val: Principal): void;
    getNextCanisterIdAvailable(): Principal;
    getNextCanisterIdAvailableAsString(): string;
    fetchAllCanisters: () => Promise<void>;
    printInfo(): {
        subnet: string;
    };
    exportObject(includeCanisters?: boolean): SubnetExport;
    exportSummary(): void;
}
