export interface ProtoBufMessage extends protobuf.Message {
    entries?: any;
}

export interface RoutingTableResponse {
    version?: Long;
    value?: Buffer;
}

export type SubnetExport = {
    id: string;
    subnetInfo: {
        idStart: string;
        idEnd: string;
        idLatest: string;
        idsTaken: number;
        idsActive: number;
    };
    canisters: [CanisterExport];
};

export type CanisterExport = {
    id: string;
    controller: [string];
    module_hash: string;
    type: string;
};
