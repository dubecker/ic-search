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
var principal_1 = require("@dfinity/principal");
var canister_1 = __importDefault(require("./canister"));
var utils_1 = require("./utils");
var MAX_CANISTERS_PER_SUBNET = Math.pow(16, 5);
var NOT_FOUND_TIMEOUT = 100; // number of times a new canister is searched for until it is certain that there are no new ones
var Subnet = /** @class */ (function () {
    // constructor(id: string) {
    function Subnet(id) {
        var _this = this;
        this._subnetInfo = {
            canisterIdStart: null,
            canisterIdEnd: null,
            // numberIdsTaken: 0,
            // numberActiveCanisters: 0,
            // lastCanisterIdFound: null,
            nextCanisterIdAvailable: null,
        };
        this._canisters = Array();
        this.getCanistersStartIdAsBlob = function () {
            return _this._subnetInfo.canisterIdStart;
        };
        this.getNumberOfCanisters = function () {
            return _this._canisters.length;
        };
        // setNumberOfOccupiedIds(val: number) {
        //     this._subnetInfo.numberIdsTaken = val;
        // }
        this.getNumberOfOccupiedIds = function () {
            return utils_1.canisterIdToDecimal(_this.getNextCanisterIdAvailable().toUint8Array());
        };
        this.getNumberOfActiveCanisters = function () {
            // return this._subnetInfo.numberActiveCanisters;
            return _this._canisters.length;
        };
        this.fetchAllCanisters = function () { return __awaiter(_this, void 0, void 0, function () {
            var nextCanisterId, iter, notFound, tmp, canister;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        nextCanisterId = this.getNextCanisterIdAvailable();
                        iter = 0;
                        notFound = 0;
                        _a.label = 1;
                    case 1:
                        if (!true) return [3 /*break*/, 3];
                        if (++iter > MAX_CANISTERS_PER_SUBNET) {
                            // break to avoid running more than maximum number of allowed canister ids
                            console.log('Reached max. number of canisters per subnet. Stopping.');
                            return [3 /*break*/, 3];
                        }
                        else if (notFound > NOT_FOUND_TIMEOUT) {
                            // break to stop if no new canisters are found for a while
                            console.log('\nNo more canisters found. Stopping at # ' +
                                utils_1.canisterIdToDecimal(this.getNextCanisterIdAvailable().toUint8Array()).toString() +
                                '. Found ' +
                                this.getNumberOfActiveCanisters().toString() +
                                '.');
                            return [3 /*break*/, 3];
                        }
                        if (iter > 10000) {
                            return [3 /*break*/, 3];
                        }
                        tmp = nextCanisterId.toText();
                        canister = new canister_1.default(
                        // Principal.fromUint8Array(canisterId).toText(),
                        // canisterId.toText(),
                        // Principal.fromText(canisterId),
                        principal_1.Principal.fromText(tmp));
                        // console.log(canister.getCanisterIdAsString());
                        process.stdout.clearLine(0);
                        process.stdout.cursorTo(0);
                        process.stdout.write('Parsing canister (' +
                            iter.toString() +
                            '): ' +
                            canister.getCanisterIdAsString());
                        // certain canisters dont have metadata but are still relevant. Ignore these
                        if (canister.isSpecialCanister()) {
                            canister.initialize(null, null, 'Special', null);
                            // canisterId = await Canister.incrementCanister(canisterId);
                        }
                        return [4 /*yield*/, canister.fetchCanisterInfo()];
                    case 2:
                        // fetch metadata of canisters, if one is found, returns true, else no further canisters exist and stop
                        if (!(_a.sent())) {
                            return [3 /*break*/, 3];
                        }
                        // if controller is assigned, canister is active. Otherwise ignore
                        if (canister.getController() || canister.getModuleHash()) {
                            this._canisters.push(canister);
                            // this.setLatestCanisterId(Principal.fromText(canisterId));
                            // this.setNextCanisterIdAvailable(nextCanisterId);
                            notFound = 0;
                        }
                        notFound++;
                        // canisterId = incrementPrincipal(
                        //     Principal.fromText(canisterId),
                        // ).toText();
                        nextCanisterId = utils_1.incrementPrincipal(nextCanisterId);
                        return [3 /*break*/, 1];
                    case 3:
                        // console.log(textFromPrincipalBlob(this.getLatestCanisterId()));
                        process.stdout.write('\n');
                        return [2 /*return*/];
                }
            });
        }); };
        // construct with human readable string representation
        this._id = id;
    }
    Subnet.prototype.assignCanisterRange = function (start, end) {
        // assign with blob representation
        this._subnetInfo.canisterIdStart = start;
        this._subnetInfo.canisterIdEnd = end;
        var tmp = start.toText();
        this._subnetInfo.nextCanisterIdAvailable = principal_1.Principal.fromText(tmp);
    };
    Subnet.prototype.getNodeIdAsString = function () {
        // return Principal.fromUint8Array(this._id).toText();
        // return this._id;
        return this._id.toText();
    };
    Subnet.prototype.getCanistersStartIdAsString = function () {
        return this._subnetInfo.canisterIdStart.toText();
    };
    Subnet.prototype.getCanistersEndIdAsString = function () {
        return this._subnetInfo.canisterIdEnd.toText();
    };
    Subnet.prototype.setNextCanisterIdAvailable = function (val) {
        // to avoid pass by reference, create new object to pass by value.
        this._subnetInfo.nextCanisterIdAvailable = val;
    };
    Subnet.prototype.getNextCanisterIdAvailable = function () {
        // return Canister.incrementCanisterBy(
        //     this.getCanistersStartIdAsBlob(),
        //     this.getNumberOfOccupiedIds(),
        // );
        return this._subnetInfo.nextCanisterIdAvailable
            ? this._subnetInfo.nextCanisterIdAvailable
            : this._subnetInfo.canisterIdStart;
        // : Principal.fromUint8Array(this._subnetInfo.canisterIdStart);
    };
    Subnet.prototype.getNextCanisterIdAvailableAsString = function () {
        // return textFromPrincipalBlob(this.getLatestCanisterId());
        return this.getNextCanisterIdAvailable().toText();
    };
    Subnet.prototype.printInfo = function () {
        var s = { subnet: this.getNodeIdAsString() };
        return s;
    };
    Subnet.prototype.exportObject = function (includeCanisters) {
        if (includeCanisters === void 0) { includeCanisters = true; }
        var output = {};
        var info = {
            canisterIdStart: this.getCanistersStartIdAsString(),
            canisterIdEnd: this.getCanistersEndIdAsString(),
            canisterIdNext: this.getNextCanisterIdAvailableAsString(),
            canisterIdsTaken: this.getNumberOfOccupiedIds(),
            canisterIdsActive: this.getNumberOfActiveCanisters(),
        };
        // let output = {
        //     id: this.getNodeIdAsString(),
        //     subnetInfo: info,
        // };
        output.id = this.getNodeIdAsString();
        output.subnetInfo = info;
        if (includeCanisters) {
            // let tmp = {} as [CanisterExport];
            var tmp = [];
            // let tmp = [];
            if (this.getNumberOfCanisters() > 0) {
                for (var _i = 0, _a = this._canisters; _i < _a.length; _i++) {
                    var canister = _a[_i];
                    tmp.push(canister.exportObject());
                }
            }
            else {
                // tmp = [];
            }
            output.canisters = tmp;
        }
        return output;
    };
    Subnet.prototype.exportSummary = function () { };
    return Subnet;
}());
exports.default = Subnet;
//# sourceMappingURL=subnet.js.map