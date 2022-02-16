import { HttpAgent } from '@dfinity/agent';
import { BinaryBlob } from '@dfinity/candid';
import { Principal } from '@dfinity/principal';
import { CanisterExport } from './types';
export default class Canister {
    _id: Principal;
    _controllers: [string];
    _module_hash: string;
    _type: string;
    _subnet: string;
    constructor(id: Principal);
    initialize: (controllers: [string], module_hash: string, type: string, subnet: string) => void;
    setController(controllers: [string]): void;
    getController(): [string];
    setModuleHash(h: string): void;
    getModuleHash(): string;
    setSubnet(s: string): void;
    getSubnet(): string;
    setType(type: string): void;
    getType(): string;
    getCanisterIdAsBlob(): BinaryBlob;
    getCanisterIdAsString(): string;
    isSpecialCanister(): boolean;
    fetchCanisterInfo(agent?: HttpAgent): Promise<boolean>;
    exportObject(): CanisterExport;
}
