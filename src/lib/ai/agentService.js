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
exports.__esModule = true;
exports.agentService = void 0;
var client_1 = require("@prisma/client");
var ProviderManager_1 = require("./providers/ProviderManager");
var AgentService = /** @class */ (function () {
    function AgentService() {
        this.initialized = false;
    }
    AgentService.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.initialized) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, ProviderManager_1.ProviderManager.initializeProviders({
                                openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY
                            })];
                    case 1:
                        _a.sent();
                        this.initialized = true;
                        return [2 /*return*/];
                }
            });
        });
    };
    AgentService.prototype.connectAgent = function (agentType, departmentId) {
        return __awaiter(this, void 0, void 0, function () {
            var provider, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.initialize()];
                    case 1:
                        _a.sent();
                        provider = ProviderManager_1.ProviderManager.getPrimaryProvider();
                        // Test the connection by sending a simple message
                        return [4 /*yield*/, provider.chat([{
                                    role: 'system',
                                    content: "You are now initializing as a ".concat(agentType, " agent.")
                                }])];
                    case 2:
                        // Test the connection by sending a simple message
                        _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                agent: {
                                    type: agentType,
                                    status: client_1.AgentStatus.BUSY,
                                    departmentId: departmentId
                                }
                            }];
                    case 3:
                        error_1 = _a.sent();
                        console.error('Failed to connect agent:', error_1);
                        return [2 /*return*/, {
                                success: false,
                                error: error_1 instanceof Error ? error_1.message : 'Unknown error occurred'
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    AgentService.prototype.disconnectAgent = function (agentId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // Simply mark the agent as available since there's no actual connection to close
                    return [2 /*return*/, {
                            success: true
                        }];
                }
                catch (error) {
                    console.error('Failed to disconnect agent:', error);
                    return [2 /*return*/, {
                            success: false,
                            error: error instanceof Error ? error.message : 'Unknown error occurred'
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    AgentService.prototype.sendMessage = function (agentType, message, context) {
        return __awaiter(this, void 0, void 0, function () {
            var provider, response, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.initialize()];
                    case 1:
                        _a.sent();
                        provider = ProviderManager_1.ProviderManager.getPrimaryProvider();
                        return [4 /*yield*/, provider.chat([
                                {
                                    role: 'system',
                                    content: "You are a ".concat(agentType, " agent. ").concat(context ? JSON.stringify(context) : '')
                                },
                                {
                                    role: 'user',
                                    content: message
                                }
                            ])];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                response: response.content
                            }];
                    case 3:
                        error_2 = _a.sent();
                        console.error('Failed to send message:', error_2);
                        return [2 /*return*/, {
                                success: false,
                                error: error_2 instanceof Error ? error_2.message : 'Unknown error occurred'
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    AgentService.prototype.getAllAgents = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // This would typically fetch from a database, but for now return an empty array
                    return [2 /*return*/, {
                            success: true,
                            agents: []
                        }];
                }
                catch (error) {
                    console.error('Failed to get agents:', error);
                    return [2 /*return*/, {
                            success: false,
                            error: error instanceof Error ? error.message : 'Unknown error occurred'
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    return AgentService;
}());
exports.agentService = new AgentService();
