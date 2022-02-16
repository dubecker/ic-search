import { blobFromText, blobFromUint8Array } from '@dfinity/candid';
import { Principal } from '@dfinity/principal';

export const getCandidHack_interface = ({IDL}) =>
    IDL.Service({
        __get_candid_interface_tmp_hack: IDL.Func([], [IDL.Text], ['query']),
    });

export const blobFromPrincipalString = (p) => {
    return blobFromUint8Array(Principal.fromText(p).toUint8Array());
};

export const textFromPrincipalBlob = (p) => {
    return Principal.fromUint8Array(p).toText();
};

export const getCurrentDate = () => {
    var d = new Date();
    let date = [
        d.getFullYear().toString().slice(-2),
        ('0' + (d.getMonth() + 1)).slice(-2),
        ('0' + d.getDate()).slice(-2),
        '-',
        ('0' + d.getHours()).slice(-2),
        ('0' + d.getMinutes()).slice(-2),
    ].join('');

    return date;
};

export function incrementPrincipal(cid: Principal) {
    let canisterId = cid.toUint8Array();
    for (let i = canisterId.length - 3; i >= 0; i--) {
        let id = canisterId[i] + 1;
        canisterId[i] = id;
        if (id > 255) {
            // increment next byte as well if 255 is exceeded, else stop
            continue;
        }
        break;
    }
    return Principal.fromUint8Array(canisterId);
}

export function incrementPrincipalBy(
    canisterId: Principal,
    incr: number,
): Principal {
    for (let i = 0; i < incr; ++i) {
        canisterId = incrementPrincipal(canisterId);
    }
    return canisterId;
}

export function canisterIdToDecimal(val) {
    // Canister id ranges from 0 to 16**5-1.
    // Buffer bytes 5,6,7 are the id counter of the canister.
    // Of byte 5, only the second hexadecimal digit is part of the id.
    // The first hex digit is counting up with each subnet.
    return (val[5] & 15) * 256 ** 2 + val[6] * 256 + val[7];
}
