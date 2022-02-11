import { Principal } from '@dfinity/principal';
import Canister from './canister';
export default class Subnet {
    _id: string;
    _subnetInfo: {
        idStart: any;
        idEnd: any;
        lastIdFound: any;
    };
    _canisters: Canister[];
    constructor(id: string);
    assignCanisterRange(start: any, end: any): void;
    getNodeIdAsString(): string;
    getCanistersStartIdAsBlob: () => any;
    getCanistersStartIdAsString: () => string;
    getCanistersEndIdAsString: () => string;
    getNumberOfCanisters: () => number;
    getNumberOfOccupiedIds: () => any;
    getNumberOfActiveCanisters: () => number;
    setLatestCanisterId(val: Principal): void;
    getLatestCanisterId(): Principal;
    getLatestCanisterIdAsString(): string;
    fetchAllCanisters: () => Promise<void>;
    printInfo(): {
        subnet: string;
    };
    exportObject(includeCanisters?: boolean): {
        id: string;
        subnetInfo: {
            idStart: string;
            idEnd: string;
            idLatest: string;
            idsTaken: any;
            idsActive: number;
        };
    };
    exportSummary(): void;
}
