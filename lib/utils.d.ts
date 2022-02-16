import { Principal } from '@dfinity/principal';
export declare const getCandidHack_interface: ({ IDL }: {
    IDL: any;
}) => any;
export declare const blobFromPrincipalString: (p: any) => import("@dfinity/candid").BinaryBlob;
export declare const textFromPrincipalBlob: (p: any) => string;
export declare const getCurrentDate: () => string;
export declare function incrementPrincipal(cid: Principal): Principal;
export declare function incrementPrincipalBy(canisterId: Principal, incr: number): Principal;
export declare function canisterIdToDecimal(val: any): any;
