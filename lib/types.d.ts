/// <reference types="long" />
/// <reference types="node" />
export interface ProtoBufMessage extends protobuf.Message {
    entries?: any;
}
export interface RoutingTableResponse {
    version?: Long;
    value?: Buffer;
}
export declare type SubnetExport = {
    id: string;
    subnetInfo: {
        canisterIdStart: string;
        canisterIdEnd: string;
        canisterIdNext: string;
        canisterIdsTaken: number;
        canisterIdsActive: number;
    };
    canisters: CanisterExport[];
};
export declare type CanisterExport = {
    id: string;
    controller: [string];
    module_hash: string;
    type: string;
};
