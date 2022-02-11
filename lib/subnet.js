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
var Subnet = /** @class */ (function () {
    function Subnet(id) {
        var _this = this;
        this._subnetInfo = {
            idStart: null,
            idEnd: null,
            // numberIdsTaken: 0,
            // numberActiveCanisters: 0,
            lastIdFound: null,
        };
        this._canisters = Array();
        this.getCanistersStartIdAsBlob = function () {
            return _this._subnetInfo.idStart;
        };
        this.getCanistersStartIdAsString = function () {
            return utils_1.textFromPrincipalBlob(_this._subnetInfo.idStart);
        };
        this.getCanistersEndIdAsString = function () {
            return utils_1.textFromPrincipalBlob(_this._subnetInfo.idEnd);
        };
        this.getNumberOfCanisters = function () {
            return _this._canisters.length;
        };
        // setNumberOfOccupiedIds(val: number) {
        //     this._subnetInfo.numberIdsTaken = val;
        // }
        this.getNumberOfOccupiedIds = function () {
            return (canister_1.default.canisterIdToDecimal(_this.getLatestCanisterId().toUint8Array()) + 1);
        };
        // setNumberOfActiveCanisters(val) {
        //     this._subnetInfo.numberActiveCanisters = val;
        // }
        this.getNumberOfActiveCanisters = function () {
            // return this._subnetInfo.numberActiveCanisters;
            return _this._canisters.length;
        };
        this.fetchAllCanisters = function () { return __awaiter(_this, void 0, void 0, function () {
            var canisterId, iter, notFound, canister;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        canisterId = this.getLatestCanisterId();
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
                        else if (notFound > 100) {
                            // break to stop if no new canisters are found for a while
                            console.log('\nNo more canisters found. Stopping at # ' +
                                (canister_1.default.canisterIdToDecimal(this.getLatestCanisterId().toUint8Array()) + 1).toString() +
                                '. Found ' +
                                this.getNumberOfActiveCanisters().toString() +
                                '.');
                            return [3 /*break*/, 3];
                        }
                        if (iter > 100000) {
                            return [3 /*break*/, 3];
                        }
                        canister = new canister_1.default(
                        // Principal.fromUint8Array(canisterId).toText(),
                        canisterId.toText());
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
                            // console.log('\n', this.getLatestCanisterId());
                            this.setLatestCanisterId(canisterId); // pass by value
                            // console.log('\n', this.getLatestCanisterId());
                            notFound = 0;
                        }
                        notFound++;
                        canisterId = principal_1.Principal.fromUint8Array(canister_1.default.incrementCanister(canisterId.toUint8Array())); // pass by reference
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
        this._subnetInfo.idStart = start;
        this._subnetInfo.idEnd = end;
    };
    Subnet.prototype.getNodeIdAsString = function () {
        // return Principal.fromUint8Array(this._id).toText();
        return this._id;
    };
    // incrementActiveCanisters = () => {
    //     this._subnetInfo.numberActiveCanisters++;
    // };
    // incrementCanisterIdsTaken = () => {
    //     this._subnetInfo.numberIdsTaken++;
    // };
    Subnet.prototype.setLatestCanisterId = function (val) {
        // to avoid pass by reference, create new object to pass by value.
        this._subnetInfo.lastIdFound = val;
    };
    Subnet.prototype.getLatestCanisterId = function () {
        // return Canister.incrementCanisterBy(
        //     this.getCanistersStartIdAsBlob(),
        //     this.getNumberOfOccupiedIds(),
        // );
        return this._subnetInfo.lastIdFound
            ? this._subnetInfo.lastIdFound
            : principal_1.Principal.fromUint8Array(this._subnetInfo.idStart);
    };
    Subnet.prototype.getLatestCanisterIdAsString = function () {
        // return textFromPrincipalBlob(this.getLatestCanisterId());
        return this.getLatestCanisterId().toText();
    };
    Subnet.prototype.printInfo = function () {
        var s = { subnet: this.getNodeIdAsString() };
        return s;
    };
    Subnet.prototype.exportObject = function (includeCanisters) {
        if (includeCanisters === void 0) { includeCanisters = true; }
        var info = {
            idStart: this.getCanistersStartIdAsString(),
            idEnd: this.getCanistersEndIdAsString(),
            idLatest: this.getLatestCanisterIdAsString(),
            idsTaken: this.getNumberOfOccupiedIds(),
            idsActive: this.getNumberOfActiveCanisters(),
        };
        var output = {
            id: this.getNodeIdAsString(),
            subnetInfo: info,
        };
        if (includeCanisters) {
            var tmp = [];
            if (this.getNumberOfCanisters() > 0) {
                for (var _i = 0, _a = this._canisters; _i < _a.length; _i++) {
                    var canister = _a[_i];
                    tmp.push(canister.exportObject());
                }
            }
            else {
                tmp = [''];
            }
            output['canisters'] = tmp;
        }
        return output;
    };
    Subnet.prototype.exportSummary = function () { };
    return Subnet;
}());
exports.default = Subnet;
//# sourceMappingURL=subnet.js.map