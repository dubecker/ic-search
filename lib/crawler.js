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
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var protobufjs_1 = __importDefault(require("protobufjs"));
var agent_1 = require("@dfinity/agent");
var candid_1 = require("@dfinity/candid");
var principal_1 = require("@dfinity/principal");
// import extendProtobuf from '../lib';
var agent_pb_1 = __importDefault(require("./agent-pb"));
var canister_1 = __importDefault(require("./canister"));
var subnet_1 = __importDefault(require("./subnet"));
var utils_1 = require("./utils");
// import root from protobuf.Root.fromJSON(require('./bundle.json'));
// const bundle = require('../ic/bundle.json');
var root = protobufjs_1.default.Root.fromJSON(require('../ic/bundle.json'));
var agent = new agent_1.HttpAgent({ host: 'https://ic0.app' });
var EXPORT_DIR = 'export';
var Crawler = /** @class */ (function () {
    function Crawler() {
        var _this = this;
        this._subnets = Array();
        this._enableExport = false;
        this.fetchAllSubnets = function () { return __awaiter(_this, void 0, void 0, function () {
            var registry, routingTableResponse, output, subnetArray, _i, _a, value, subnet;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        registry = agent_1.Actor.createActor(function () { return candid_1.IDL.Service({}); }, {
                            agent: agent,
                            canisterId: 'rwlgt-iiaaa-aaaaa-aaaaa-cai',
                        });
                        agent_pb_1.default(registry, root.lookupService('Registry'));
                        return [4 /*yield*/, registry.get_value({
                                key: Buffer.from('routing_table'),
                            })];
                    case 1:
                        routingTableResponse = _b.sent();
                        output = root
                            .lookupType('RoutingTable')
                            .decode(routingTableResponse.value);
                        subnetArray = [];
                        for (_i = 0, _a = output.entries; _i < _a.length; _i++) {
                            value = _a[_i];
                            subnet = new subnet_1.default(
                            // Principal.fromUint8Array(
                            //     value.subnetId.principalId.raw,
                            // ).toText(),
                            principal_1.Principal.fromUint8Array(value.subnetId.principalId.raw));
                            subnet.assignCanisterRange(principal_1.Principal.fromUint8Array(value.range.startCanisterId.principalId.raw), principal_1.Principal.fromUint8Array(value.range.endCanisterId.principalId.raw));
                            subnetArray.push(subnet);
                        }
                        this._subnets = subnetArray;
                        return [2 /*return*/];
                }
            });
        }); };
        this.parseAllSubnets = function () { return __awaiter(_this, void 0, void 0, function () {
            var iter, _i, _a, subnet, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        iter = 0;
                        _i = 0, _a = this._subnets;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 7];
                        subnet = _a[_i];
                        process.stdout.write('\n' + 'Parsing subnet: ' + subnet.getNodeIdAsString() + '\n');
                        return [4 /*yield*/, subnet.fetchAllCanisters()];
                    case 2:
                        _c.sent();
                        if (!this.enableExport) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.exportSubnetToFile(subnet)];
                    case 3:
                        _b = _c.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        _b = null;
                        _c.label = 5;
                    case 5:
                        _b;
                        // await this.exportSubnetToFile(subnet);
                        if (++iter > 99) {
                            // for testing purposes
                            return [3 /*break*/, 7];
                        }
                        _c.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 1];
                    case 7: return [2 /*return*/];
                }
            });
        }); };
        this.printNetwork = function () { return __awaiter(_this, void 0, void 0, function () {
            var _i, _a, subnet;
            return __generator(this, function (_b) {
                // let tmp = await this.exportObject();
                // console.log(tmp);
                // console.log(JSON.stringify(tmp));
                for (_i = 0, _a = this._subnets; _i < _a.length; _i++) {
                    subnet = _a[_i];
                    console.log(subnet.exportObject(false));
                }
                return [2 /*return*/];
            });
        }); };
        this.exportNetworkInfoToFile = function () { return __awaiter(_this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.exportObject(false)];
                    case 1:
                        data = _a.sent();
                        this.writeToFile(JSON.stringify(data), this.outputDir, '_info.json');
                        return [2 /*return*/];
                }
            });
        }); };
        this.exportSubnetToFile = function (s) { return __awaiter(_this, void 0, void 0, function () {
            var data, dataString, fileName;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, s.exportObject()];
                    case 1:
                        data = _a.sent();
                        dataString = JSON.stringify(data);
                        fileName = s.getNodeIdAsString() + '.json';
                        return [4 /*yield*/, this.writeToFile(dataString, this.outputDir, fileName)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        this.initializeExport = function () {
            _this.enableExport = true;
            _this.outputDir = path_1.default.join(EXPORT_DIR, utils_1.getCurrentDate());
        };
        this.writeToFile = function (data, dir, fileName) { return __awaiter(_this, void 0, void 0, function () {
            var filePath;
            return __generator(this, function (_a) {
                fs_1.default.mkdirSync(dir, { recursive: true });
                filePath = path_1.default.join(dir, fileName);
                fs_1.default.writeFile(filePath, data, function (err) {
                    if (err) {
                        console.log(err);
                    }
                });
                console.log('File', fileName, 'written successfully.');
                return [2 /*return*/];
            });
        }); };
    }
    Object.defineProperty(Crawler.prototype, "enableExport", {
        get: function () {
            return this._enableExport;
        },
        set: function (enable) {
            this._enableExport = enable;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Crawler.prototype, "outputDir", {
        get: function () {
            return this._outputDir;
        },
        set: function (dir) {
            this._outputDir = dir;
        },
        enumerable: false,
        configurable: true
    });
    Crawler.prototype.exportObject = function (includeCanisters) {
        if (includeCanisters === void 0) { includeCanisters = true; }
        return __awaiter(this, void 0, void 0, function () {
            var tmp, _i, _a, subnet;
            return __generator(this, function (_b) {
                tmp = [];
                for (_i = 0, _a = this._subnets; _i < _a.length; _i++) {
                    subnet = _a[_i];
                    tmp.push(subnet.exportObject(includeCanisters));
                }
                return [2 /*return*/, { subnets: tmp }];
            });
        });
    };
    Crawler.prototype.run = function (initFromFile) {
        if (initFromFile === void 0) { initFromFile = true; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // if initialized from file, script assumes that there have been no new subnets added since last run.
                    // Needs to be improved..
                    return [4 /*yield*/, this.fetchAllSubnets()];
                    case 1:
                        // if initialized from file, script assumes that there have been no new subnets added since last run.
                        // Needs to be improved..
                        _a.sent();
                        if (initFromFile) {
                            this.initializeFromFile();
                        }
                        return [4 /*yield*/, this.parseAllSubnets()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.exportNetworkInfoToFile()];
                    case 3:
                        _a.sent();
                        console.log('Crawler finsihed successfully.');
                        return [2 /*return*/];
                }
            });
        });
    };
    Crawler.prototype.initializeFromFile = function () {
        return __awaiter(this, void 0, void 0, function () {
            var latestDate, latestDir, storedFiles, _i, _a, subnet, subnetFile, subnetStored, _b, _c, c, canister;
            return __generator(this, function (_d) {
                latestDate = fs_1.default.readdirSync(EXPORT_DIR).sort(function () { return -1; })[0];
                latestDir = path_1.default.join(EXPORT_DIR, latestDate);
                storedFiles = fs_1.default.readdirSync(latestDir);
                for (_i = 0, _a = this._subnets; _i < _a.length; _i++) {
                    subnet = _a[_i];
                    subnetFile = subnet.getNodeIdAsString() + '.json';
                    if (storedFiles.includes(subnetFile)) {
                        console.log('Initializing', subnet.getNodeIdAsString(), 'from file.');
                        subnetStored = require(path_1.default.join('../', latestDir, subnetFile));
                        // initialize information
                        subnet.setNextCanisterIdAvailable(principal_1.Principal.fromText(subnetStored.subnetInfo.canisterIdNext));
                        // subnet.setNumberOfActiveCanisters(
                        //     subnetStored.subnetInfo.idsActive,
                        // );
                        // subnet.setNumberOfOccupiedIds(subnetStored.subnetInfo.idsTaken);
                        // initialize canister list
                        for (_b = 0, _c = subnetStored.canisters; _b < _c.length; _b++) {
                            c = _c[_b];
                            canister = new canister_1.default(principal_1.Principal.fromText(c.id));
                            canister.initialize(c.controller, c.module_hash, c.type, subnet.getNodeIdAsString());
                            subnet._canisters.push(canister);
                        }
                    }
                }
                return [2 /*return*/];
            });
        });
    };
    return Crawler;
}());
exports.default = Crawler;
//# sourceMappingURL=crawler.js.map