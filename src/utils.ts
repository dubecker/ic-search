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
