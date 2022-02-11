"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentDate = exports.textFromPrincipalBlob = exports.blobFromPrincipalString = exports.getCandidHack_interface = void 0;
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
//# sourceMappingURL=utils.js.map