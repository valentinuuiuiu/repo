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
var _a;
exports.__esModule = true;
exports.OpenAICompatibleProvider = exports.OpenAIProvider = exports.ProviderType = exports.ProviderManager = void 0;
var BaseProvider_1 = require("./BaseProvider");
exports.ProviderType = BaseProvider_1.ProviderType;
var OpenAIProvider_1 = require("./OpenAIProvider");
exports.OpenAIProvider = OpenAIProvider_1.OpenAIProvider;
var OpenAICompatibleProvider_1 = require("./OpenAICompatibleProvider");
exports.OpenAICompatibleProvider = OpenAICompatibleProvider_1.OpenAICompatibleProvider;
var ProviderManager = /** @class */ (function () {
    function ProviderManager() {
    }
    /**
     * Initialize providers with configuration
     */
    ProviderManager.initializeProviders = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Initialize OpenAI as primary provider
                if (config.openaiApiKey) {
                    try {
                        this.primaryProvider = this.createProvider(BaseProvider_1.ProviderType.OPENAI, {
                            apiKey: config.openaiApiKey,
                            model: 'gpt-4',
                            temperature: 0.7,
                            maxTokens: 1000,
                            timeout: 30000
                        });
                        console.log('Primary provider (OpenAI) initialized successfully');
                    }
                    catch (error) {
                        console.error('Failed to initialize primary provider:', error);
                    }
                }
                // Initialize Ollama as fallback provider
                if (config.ollamaBaseUrl) {
                    try {
                        this.fallbackProvider = this.createProvider(BaseProvider_1.ProviderType.OLLAMA, {
                            baseUrl: config.ollamaBaseUrl,
                            model: 'llama2',
                            temperature: 0.7,
                            maxTokens: 1000,
                            timeout: 30000,
                            apiKey: '' // Empty key for Ollama
                        });
                        console.log('Fallback provider (Ollama) initialized successfully');
                    }
                    catch (error) {
                        console.error('Failed to initialize fallback provider:', error);
                    }
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Create a provider instance based on the provider type
     * @param type Provider type
     * @param config Provider configuration
     * @returns Provider instance
     */
    ProviderManager.createProvider = function (type, config) {
        var factory = this.providerFactories[type];
        if (!factory) {
            throw new Error("No provider factory found for type: ".concat(type));
        }
        return factory.createProvider(config);
    };
    /**
     * Get supported models for a specific provider type
     * @param type Provider type
     * @returns List of supported models
     */
    ProviderManager.getSupportedModels = function (type) {
        var factory = this.providerFactories[type];
        if (!factory) {
            throw new Error("No provider factory found for type: ".concat(type));
        }
        return factory.getSupportedModels();
    };
    /**
     * List all available provider types
     * @returns Array of provider types
     */
    ProviderManager.listProviderTypes = function () {
        return Object.keys(this.providerFactories);
    };
    /**
     * Get the primary provider
     */
    ProviderManager.getPrimaryProvider = function () {
        if (!this.primaryProvider) {
            throw new Error('Primary provider not initialized');
        }
        return this.primaryProvider;
    };
    /**
     * Get the fallback provider
     */
    ProviderManager.getFallbackProvider = function () {
        if (!this.fallbackProvider) {
            throw new Error('Fallback provider not initialized');
        }
        return this.fallbackProvider;
    };
    /**
     * Execute a request with fallback
     */
    ProviderManager.executeWithFallback = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 6]);
                        if (!this.primaryProvider) return [3 /*break*/, 2];
                        return [4 /*yield*/, request(this.primaryProvider)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2: throw new Error('Primary provider not available');
                    case 3:
                        error_1 = _a.sent();
                        console.warn('Primary provider failed, falling back to Ollama:', error_1);
                        if (!this.fallbackProvider) return [3 /*break*/, 5];
                        return [4 /*yield*/, request(this.fallbackProvider)];
                    case 4: return [2 /*return*/, _a.sent()];
                    case 5: throw error_1;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    ProviderManager.primaryProvider = null;
    ProviderManager.fallbackProvider = null;
    ProviderManager.providerFactories = (_a = {},
        _a[BaseProvider_1.ProviderType.OPENAI] = OpenAIProvider_1.OpenAIProviderFactory,
        _a[BaseProvider_1.ProviderType.OLLAMA] = OpenAICompatibleProvider_1.OpenAICompatibleProviderFactory,
        _a);
    return ProviderManager;
}());
exports.ProviderManager = ProviderManager;
