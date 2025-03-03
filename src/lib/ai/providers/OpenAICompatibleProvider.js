"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
exports.__esModule = true;
exports.OpenAICompatibleProviderFactory = exports.OpenAICompatibleProvider = void 0;
var axios_1 = require("axios");
var BaseProvider_1 = require("./BaseProvider");
var OpenAICompatibleProvider = /** @class */ (function (_super) {
    __extends(OpenAICompatibleProvider, _super);
    function OpenAICompatibleProvider(config) {
        var _this = _super.call(this, config) || this;
        if (!config.baseUrl) {
            throw new Error('Base URL is required for OpenAI-compatible providers');
        }
        _this.baseURL = config.baseUrl;
        return _this;
    }
    OpenAICompatibleProvider.prototype.chat = function (messages) {
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, void 0, function () {
            var response, error_1;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _g.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1["default"].post("".concat(this.baseURL, "/v1/chat/completions"), {
                                model: this.config.model || 'sisaai/sisaai-tulu3-llama3.1:latest',
                                messages: messages,
                                temperature: this.config.temperature || 0.7,
                                max_tokens: this.config.maxTokens || 1000,
                                stream: false
                            }, {
                                headers: __assign({ 'Content-Type': 'application/json' }, (this.config.apiKey ? { 'Authorization': "Bearer ".concat(this.config.apiKey) } : {})),
                                timeout: this.config.timeout || 30000
                            })];
                    case 1:
                        response = _g.sent();
                        return [2 /*return*/, {
                                content: ((_b = (_a = response.data.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '',
                                tokenUsage: {
                                    promptTokens: ((_c = response.data.usage) === null || _c === void 0 ? void 0 : _c.prompt_tokens) || 0,
                                    completionTokens: ((_d = response.data.usage) === null || _d === void 0 ? void 0 : _d.completion_tokens) || 0,
                                    totalTokens: ((_e = response.data.usage) === null || _e === void 0 ? void 0 : _e.total_tokens) || 0
                                },
                                finishReason: (_f = response.data.choices[0]) === null || _f === void 0 ? void 0 : _f.finish_reason,
                                metadata: {
                                    model: response.data.model,
                                    provider: BaseProvider_1.ProviderType.OLLAMA
                                }
                            }];
                    case 2:
                        error_1 = _g.sent();
                        console.error('Ollama Chat Error:', error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    OpenAICompatibleProvider.prototype.generateEmbeddings = function (texts) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1["default"].post("".concat(this.baseURL, "/v1/embeddings"), {
                                model: this.config.model || 'sisaai/sisaai-tulu3-llama3.1:latest',
                                input: texts
                            }, {
                                headers: __assign({ 'Content-Type': 'application/json' }, (this.config.apiKey ? { 'Authorization': "Bearer ".concat(this.config.apiKey) } : {})),
                                timeout: this.config.timeout || 30000
                            })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data.data.map(function (item) { return item.embedding; })];
                    case 2:
                        error_2 = _a.sent();
                        console.error('Ollama Embedding Error:', error_2);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    OpenAICompatibleProvider.prototype.listAvailableModels = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1["default"].get("".concat(this.baseURL, "/v1/models"), {
                                headers: __assign({ 'Content-Type': 'application/json' }, (this.config.apiKey ? { 'Authorization': "Bearer ".concat(this.config.apiKey) } : {})),
                                timeout: this.config.timeout || 30000
                            })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data.data.map(function (model) { return model.id; })];
                    case 2:
                        error_3 = _a.sent();
                        console.error('Error fetching Ollama models:', error_3);
                        return [2 /*return*/, ['sisaai/sisaai-tulu3-llama3.1:latest']];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Streaming chat implementation
    OpenAICompatibleProvider.prototype.streamChat = function (messages) {
        var _a, _b, _c;
        return __asyncGenerator(this, arguments, function streamChat_1() {
            var response, _d, _e, chunk, lines, _i, lines_1, line, data, e_1_1, error_4;
            var e_1, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _g.trys.push([0, 18, , 19]);
                        return [4 /*yield*/, __await(axios_1["default"].post("".concat(this.baseURL, "/v1/chat/completions"), {
                                model: this.config.model || 'sisaai/sisaai-tulu3-llama3.1:latest',
                                messages: messages,
                                temperature: this.config.temperature || 0.7,
                                max_tokens: this.config.maxTokens || 1000,
                                stream: true
                            }, {
                                headers: __assign({ 'Content-Type': 'application/json' }, (this.config.apiKey ? { 'Authorization': "Bearer ".concat(this.config.apiKey) } : {})),
                                responseType: 'stream',
                                timeout: this.config.timeout || 30000
                            }))];
                    case 1:
                        response = _g.sent();
                        _g.label = 2;
                    case 2:
                        _g.trys.push([2, 11, 12, 17]);
                        _d = __asyncValues(response.data);
                        _g.label = 3;
                    case 3: return [4 /*yield*/, __await(_d.next())];
                    case 4:
                        if (!(_e = _g.sent(), !_e.done)) return [3 /*break*/, 10];
                        chunk = _e.value;
                        lines = chunk.toString().split('\n').filter(Boolean);
                        _i = 0, lines_1 = lines;
                        _g.label = 5;
                    case 5:
                        if (!(_i < lines_1.length)) return [3 /*break*/, 9];
                        line = lines_1[_i];
                        if (!line.startsWith('data: ')) return [3 /*break*/, 8];
                        data = JSON.parse(line.slice(6));
                        if (!((_c = (_b = (_a = data.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.delta) === null || _c === void 0 ? void 0 : _c.content)) return [3 /*break*/, 8];
                        return [4 /*yield*/, __await(data.choices[0].delta.content)];
                    case 6: return [4 /*yield*/, _g.sent()];
                    case 7:
                        _g.sent();
                        _g.label = 8;
                    case 8:
                        _i++;
                        return [3 /*break*/, 5];
                    case 9: return [3 /*break*/, 3];
                    case 10: return [3 /*break*/, 17];
                    case 11:
                        e_1_1 = _g.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 17];
                    case 12:
                        _g.trys.push([12, , 15, 16]);
                        if (!(_e && !_e.done && (_f = _d["return"]))) return [3 /*break*/, 14];
                        return [4 /*yield*/, __await(_f.call(_d))];
                    case 13:
                        _g.sent();
                        _g.label = 14;
                    case 14: return [3 /*break*/, 16];
                    case 15:
                        if (e_1) throw e_1.error;
                        return [7 /*endfinally*/];
                    case 16: return [7 /*endfinally*/];
                    case 17: return [3 /*break*/, 19];
                    case 18:
                        error_4 = _g.sent();
                        console.error('Ollama Streaming Error:', error_4);
                        throw error_4;
                    case 19: return [2 /*return*/];
                }
            });
        });
    };
    return OpenAICompatibleProvider;
}(BaseProvider_1.BaseProvider));
exports.OpenAICompatibleProvider = OpenAICompatibleProvider;
var OpenAICompatibleProviderFactory = /** @class */ (function () {
    function OpenAICompatibleProviderFactory() {
    }
    OpenAICompatibleProviderFactory.createProvider = function (config) {
        // Set default timeout if not provided
        var completeConfig = __assign(__assign({}, config), { timeout: config.timeout || 30000, apiKey: config.apiKey || '' });
        return new OpenAICompatibleProvider(completeConfig);
    };
    OpenAICompatibleProviderFactory.getSupportedModels = function () {
        return ['sisaai/sisaai-tulu3-llama3.1:latest'];
    };
    return OpenAICompatibleProviderFactory;
}());
exports.OpenAICompatibleProviderFactory = OpenAICompatibleProviderFactory;
