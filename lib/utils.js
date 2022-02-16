"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canisterIdToDecimal = exports.incrementPrincipalBy = exports.incrementPrincipal = exports.getCurrentDate = exports.textFromPrincipalBlob = exports.blobFromPrincipalString = exports.getCandidHack_interface = void 0;
var candid_1 = require("@dfinity/candid");
var principal_1 = require("@dfinity/principal");
var getCandidHack_interface = function (_a) {
    var IDL = _a.IDL;
    return IDL.Service({
        __get_candid_interface_tmp_hack: IDL.Func([], [IDL.Text], ['query']),
    });
};
exports.getCandidHack_interface = getCandidHack_interface;
var blobFromPrincipalString = function (p) {
    return candid_1.blobFromUint8Array(principal_1.Principal.fromText(p).toUint8Array());
};
exports.blobFromPrincipalString = blobFromPrincipalString;
var textFromPrincipalBlob = function (p) {
    return principal_1.Principal.fromUint8Array(p).toText();
};
exports.textFromPrincipalBlob = textFromPrincipalBlob;
var getCurrentDate = function () {
    var d = new Date();
    var date = [
        d.getFullYear().toString().slice(-2),
        ('0' + (d.getMonth() + 1)).slice(-2),
        ('0' + d.getDate()).slice(-2),
        '-',
        ('0' + d.getHours()).slice(-2),
        ('0' + d.getMinutes()).slice(-2),
    ].join('');
    return date;
};
exports.getCurrentDate = getCurrentDate;
function incrementPrincipal(cid) {
    var canisterId = cid.toUint8Array();
    for (var i = canisterId.length - 3; i >= 0; i--) {
        var id = canisterId[i] + 1;
        canisterId[i] = id;
        if (id > 255) {
            // increment next byte as well if 255 is exceeded, else stop
            continue;
        }
        break;
    }
    return principal_1.Principal.fromUint8Array(canisterId);
}
exports.incrementPrincipal = incrementPrincipal;
function incrementPrincipalBy(canisterId, incr) {
    for (var i = 0; i < incr; ++i) {
        canisterId = incrementPrincipal(canisterId);
    }
    return canisterId;
}
exports.incrementPrincipalBy = incrementPrincipalBy;
function canisterIdToDecimal(val) {
    // Canister id ranges from 0 to 16**5-1.
    // Buffer bytes 5,6,7 are the id counter of the canister.
    // Of byte 5, only the second hexadecimal digit is part of the id.
    // The first hex digit is counting up with each subnet.
    return (val[5] & 15) * Math.pow(256, 2) + val[6] * 256 + val[7];
}
exports.canisterIdToDecimal = canisterIdToDecimal;
//# sourceMappingURL=utils.js.map