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
exports.OpenAIProviderFactory = exports.OpenAIProvider = void 0;
var openai_1 = require("openai");
var BaseProvider_1 = require("./BaseProvider");
var OpenAIProvider = /** @class */ (function (_super) {
    __extends(OpenAIProvider, _super);
    function OpenAIProvider(config) {
        var _this = _super.call(this, config) || this;
        _this.client = new openai_1["default"]({
            apiKey: config.apiKey,
            baseURL: config.baseUrl,
            timeout: config.timeout || 30000
        });
        return _this;
    }
    OpenAIProvider.prototype.chat = function (messages) {
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, void 0, function () {
            var completion, content, error_1;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _g.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.client.chat.completions.create({
                                model: this.config.model || 'gpt-4',
                                messages: messages,
                                temperature: this.config.temperature || 0.7,
                                max_tokens: this.config.maxTokens || 1000
                            })];
                    case 1:
                        completion = _g.sent();
                        content = ((_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '';
                        return [2 /*return*/, {
                                content: content,
                                tokenUsage: {
                                    promptTokens: ((_c = completion.usage) === null || _c === void 0 ? void 0 : _c.prompt_tokens) || 0,
                                    completionTokens: ((_d = completion.usage) === null || _d === void 0 ? void 0 : _d.completion_tokens) || 0,
                                    totalTokens: ((_e = completion.usage) === null || _e === void 0 ? void 0 : _e.total_tokens) || 0
                                },
                                finishReason: ((_f = completion.choices[0]) === null || _f === void 0 ? void 0 : _f.finish_reason) || undefined,
                                metadata: {
                                    model: completion.model,
                                    provider: BaseProvider_1.ProviderType.OPENAI
                                }
                            }];
                    case 2:
                        error_1 = _g.sent();
                        console.error('OpenAI Chat Error:', error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    OpenAIProvider.prototype.streamChat = function (messages) {
        var _a, _b;
        return __asyncGenerator(this, arguments, function streamChat_1() {
            var stream, stream_1, stream_1_1, chunk, e_1_1, error_2;
            var e_1, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 16, , 17]);
                        return [4 /*yield*/, __await(this.client.chat.completions.create({
                                model: this.config.model || 'gpt-4',
                                messages: messages,
                                temperature: this.config.temperature || 0.7,
                                max_tokens: this.config.maxTokens || 1000,
                                stream: true
                            }))];
                    case 1:
                        stream = _d.sent();
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 9, 10, 15]);
                        stream_1 = __asyncValues(stream);
                        _d.label = 3;
                    case 3: return [4 /*yield*/, __await(stream_1.next())];
                    case 4:
                        if (!(stream_1_1 = _d.sent(), !stream_1_1.done)) return [3 /*break*/, 8];
                        chunk = stream_1_1.value;
                        if (!((_b = (_a = chunk.choices[0]) === null || _a === void 0 ? void 0 : _a.delta) === null || _b === void 0 ? void 0 : _b.content)) return [3 /*break*/, 7];
                        return [4 /*yield*/, __await(chunk.choices[0].delta.content)];
                    case 5: return [4 /*yield*/, _d.sent()];
                    case 6:
                        _d.sent();
                        _d.label = 7;
                    case 7: return [3 /*break*/, 3];
                    case 8: return [3 /*break*/, 15];
                    case 9:
                        e_1_1 = _d.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 15];
                    case 10:
                        _d.trys.push([10, , 13, 14]);
                        if (!(stream_1_1 && !stream_1_1.done && (_c = stream_1["return"]))) return [3 /*break*/, 12];
                        return [4 /*yield*/, __await(_c.call(stream_1))];
                    case 11:
                        _d.sent();
                        _d.label = 12;
                    case 12: return [3 /*break*/, 14];
                    case 13:
                        if (e_1) throw e_1.error;
                        return [7 /*endfinally*/];
                    case 14: return [7 /*endfinally*/];
                    case 15: return [3 /*break*/, 17];
                    case 16:
                        error_2 = _d.sent();
                        console.error('OpenAI Stream Chat Error:', error_2);
                        throw error_2;
                    case 17: return [2 /*return*/];
                }
            });
        });
    };
    OpenAIProvider.prototype.generateEmbeddings = function (texts) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.client.embeddings.create({
                                model: 'text-embedding-ada-002',
                                input: texts
                            })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data.map(function (item) { return item.embedding; })];
                    case 2:
                        error_3 = _a.sent();
                        console.error('OpenAI Embeddings Error:', error_3);
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    OpenAIProvider.getSupportedModels = function () {
        return [
            'gpt-4-0125-preview',
            'gpt-4-turbo-preview',
            'gpt-4-1106-preview',
            'gpt-4-vision-preview',
            'gpt-4',
            'gpt-3.5-turbo-0125',
            'gpt-3.5-turbo',
            'text-embedding-3-small',
            'text-embedding-3-large',
            'text-embedding-ada-002'
        ];
    };
    return OpenAIProvider;
}(BaseProvider_1.BaseProvider));
exports.OpenAIProvider = OpenAIProvider;
var OpenAIProviderFactory = /** @class */ (function () {
    function OpenAIProviderFactory() {
    }
    OpenAIProviderFactory.createProvider = function (config) {
        return new OpenAIProvider(config);
    };
    OpenAIProviderFactory.getSupportedModels = function () {
        return OpenAIProvider.getSupportedModels();
    };
    return OpenAIProviderFactory;
}());
exports.OpenAIProviderFactory = OpenAIProviderFactory;
