"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var borc_1 = __importDefault(require("borc"));
// import crypto from 'isomorphic-webcrypto';
var node_fetch_1 = __importDefault(require("node-fetch"));
var underscore_1 = __importDefault(require("underscore"));
var agent_1 = require("@dfinity/agent");
var candid_1 = require("@dfinity/candid");
var principal_1 = require("@dfinity/principal");
var utils_1 = require("./utils");
global.fetch = node_fetch_1.default;
var decoder = new borc_1.default.Decoder({
    tags: {
        55799: function (val) { return val; },
    },
});
var CANISTER_EXCEPTIONS = ['aaaaa-aa'];
var CANDID_UI_CANISTER_ID = 'a4gq6-oaaaa-aaaab-qaa4q-cai';
var CANLISTA_CANISTER_ID = 'kyhgh-oyaaa-aaaae-qaaha-cai';
var icAgent = new agent_1.HttpAgent({ host: 'https://ic0.app' });
var Canister = /** @class */ (function () {
    function Canister(id) {
        var _this = this;
        this.initialize = function (controllers, module_hash, type, subnet) {
            _this.setController(controllers);
            _this.setModuleHash(module_hash);
            _this.setType(type);
            _this.setSubnet(subnet);
        };
        // construct with human readable text representation
        this._id = id;
    }
    Canister.prototype.setController = function (controllers) {
        // construct with human readable text representation
        this._controllers = controllers;
    };
    Canister.prototype.getController = function () {
        return this._controllers;
    };
    Canister.prototype.setModuleHash = function (h) {
        this._module_hash = h;
    };
    Canister.prototype.getModuleHash = function () {
        return this._module_hash;
    };
    Canister.prototype.setSubnet = function (s) {
        this._subnet = s;
    };
    Canister.prototype.getSubnet = function () {
        return this._subnet;
    };
    Canister.prototype.setType = function (type) {
        this._type = type;
    };
    Canister.prototype.getType = function () {
        return this._type;
    };
    Canister.prototype.getCanisterIdAsBlob = function () {
        // return this._id;
        // return blobFromUint8Array(Principal.fromText(this._id).toUint8Array());
        return candid_1.blobFromUint8Array(this._id.toUint8Array());
    };
    Canister.prototype.getCanisterIdAsString = function () {
        // return Principal.fromUint8Array(this._id).toText();
        // return this._id;
        return this._id.toText();
    };
    Canister.prototype.isSpecialCanister = function () {
        return underscore_1.default.contains(CANISTER_EXCEPTIONS, this.getCanisterIdAsString());
    };
    Canister.prototype.fetchCanisterInfo = function (agent) {
        if (agent === void 0) { agent = icAgent; }
        return __awaiter(this, void 0, void 0, function () {
            var canisterId, principal, pathCommon, pathModuleHash, pathControllers, readState, e_1, cert, subnet, type, module_hash, array, moduleHash, i, controllers, controllerId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        canisterId = this.getCanisterIdAsString();
                        principal = this.getCanisterIdAsBlob();
                        pathCommon = [candid_1.blobFromText('canister'), principal];
                        pathModuleHash = pathCommon.concat(candid_1.blobFromText('module_hash'));
                        pathControllers = pathCommon.concat(candid_1.blobFromText('controllers'));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, agent.readState(canisterId, {
                                paths: [pathModuleHash, pathControllers],
                            })];
                    case 2:
                        // this will fail if no canister with the define ID exists
                        readState = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        return [2 /*return*/, false];
                    case 4:
                        cert = new agent_1.Certificate(readState, agent);
                        return [4 /*yield*/, cert.verify()];
                    case 5:
                        // console.log(cert);
                        if (_a.sent()) {
                            subnet = cert['cert'].delegation
                                ? utils_1.textFromPrincipalBlob(cert['cert'].delegation.subnet_id)
                                : null;
                            type = subnet ? 'Application' : 'NNS';
                            module_hash = cert.lookup(pathModuleHash);
                            array = new Uint8Array(module_hash);
                            moduleHash = '';
                            for (i = 0; i < array.length; i++) {
                                moduleHash += array[i].toString(16);
                            }
                            controllers = cert.lookup(pathControllers);
                            controllerId = controllers
                                ? decoder
                                    .decodeFirst(controllers)
                                    .map(function (buf) { return principal_1.Principal.fromUint8Array(buf).toText(); })
                                : null;
                            // initialize canister
                            this.initialize(controllerId, moduleHash, type, subnet);
                        }
                        else {
                            throw new Error('cert verify failed');
                        }
                        return [2 /*return*/, true];
                }
            });
        });
    };
    // ToDo
    /*
    getCandid = async (agent = icAgent) => {
        //, method_name, msg, isReply) {
        canister_id = this.getCanisterIdAsBlob();
        try {
            var did;
            var msg;
            var method_name = 'test';
            var isReply = true;
            // Try fetch i using __get_candid_interface_tmp_hack.
            try {
                did = await Actor.createActor(getCandidHack_interface, {
                    agent,
                    canisterId: canister_id,
                }).__get_candid_interface_tmp_hack();
            } catch (e) {
                console.log(e);
            }
            if (!did) {
                // Try fetch i from canlista kyhgh-oyaaa-aaaae-qaaha-cai
                try {
                    did = await Actor.createActor(getCandid_interface, {
                        agent,
                        canisterId: CANLISTA_CANISTER_ID,
                    }).getCandid(Principal.fromText(canister_id));
                } catch (e) {
                    console.log(e);
                }
                if (did.ok) {
                    did = did.ok.did;
                } else {
                    did = null;
                }
            }
        } catch (err) {
            console.log(err);
        }
        return did;
    };*/
    Canister.prototype.exportObject = function () {
        return {
            id: this.getCanisterIdAsString(),
            controller: this.getController(),
            module_hash: this.getModuleHash(),
            type: this.getType(),
        };
    };
    return Canister;
}());
exports.default = Canister;
//# sourceMappingURL=canister.js.map