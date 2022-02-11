import { HttpAgent } from '@dfinity/agent';
import { BinaryBlob } from '@dfinity/candid';
export default class Canister {
    _id: string;
    _controllers: string;
    _module_hash: string;
    _type: string;
    _subnet: string;
    constructor(id: any);
    initialize: (controllers: [string], module_hash: string, type: string, subnet: string) => void;
    setController: (controllers: any) => void;
    getController: () => string;
    setModuleHash: (h: any) => void;
    getModuleHash: () => string;
    setSubnet: (s: any) => void;
    getSubnet: () => string;
    setType: (type: any) => void;
    getType: () => string;
    getCanisterIdAsBlob(): BinaryBlob;
    getCanisterIdAsString: () => string;
    isSpecialCanister: () => any;
    static incrementCanister(canisterId: any): any;
    static incrementCanisterBy(canisterId: BinaryBlob, incr: number): BinaryBlob;
    static calculateDifference(var1: BinaryBlob, var2: BinaryBlob): number;
    static canisterIdToDecimal(val: any): any;
    fetchCanisterInfo: (agent?: HttpAgent) => Promise<boolean>;
    exportObject: () => {
        id: string;
        controller: string;
        module_hash: string;
        type: string;
    };
}
