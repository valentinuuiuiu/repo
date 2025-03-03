"use strict";
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
exports.__esModule = true;
var client_1 = require("@prisma/client");
var agentService_1 = require("../src/lib/ai/agentService");
var dotenv = require("dotenv");
// Load environment variables
dotenv.config();
// Override import.meta.env with process.env for compatibility
var env = {
    VITE_OPENAI_API_KEY: process.env.VITE_OPENAI_API_KEY,
    VITE_OPENAI_MODEL: process.env.VITE_OPENAI_MODEL,
    VITE_OPENAI_EMBEDDING_MODEL: process.env.VITE_OPENAI_EMBEDDING_MODEL
};
// Make env available globally
globalThis["import"] = { meta: { env: env } };
var prisma = new client_1.PrismaClient();
function initializeAgentSystem() {
    return __awaiter(this, void 0, void 0, function () {
        var departments, coreAgents, _i, coreAgents_1, agent, existing, created, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 10, , 11]);
                    // Initialize the agent service first
                    return [4 /*yield*/, agentService_1.agentService.initialize()];
                case 1:
                    // Initialize the agent service first
                    _a.sent();
                    return [4 /*yield*/, Promise.all([
                            prisma.department.upsert({
                                where: { code: 'CX' },
                                update: {},
                                create: {
                                    name: 'Customer Experience',
                                    description: 'Handles customer support and satisfaction',
                                    code: 'CX'
                                }
                            }),
                            prisma.department.upsert({
                                where: { code: 'OPS' },
                                update: {},
                                create: {
                                    name: 'Operations',
                                    description: 'Manages inventory and logistics',
                                    code: 'OPS'
                                }
                            }),
                            prisma.department.upsert({
                                where: { code: 'MKT' },
                                update: {},
                                create: {
                                    name: 'Market Intelligence',
                                    description: 'Analyzes market trends and opportunities',
                                    code: 'MKT'
                                }
                            })
                        ])];
                case 2:
                    departments = _a.sent();
                    coreAgents = [
                        {
                            name: 'Customer Service Agent',
                            type: client_1.AgentType.CUSTOMER_SERVICE,
                            description: 'Handles customer inquiries and support',
                            departmentId: departments[0].id,
                            capabilities: [
                                'customer_support',
                                'issue_resolution',
                                'inquiry_handling'
                            ]
                        },
                        {
                            name: 'Inventory Manager',
                            type: client_1.AgentType.INVENTORY_MANAGEMENT,
                            description: 'Manages inventory levels and stock',
                            departmentId: departments[1].id,
                            capabilities: [
                                'inventory_tracking',
                                'stock_management',
                                'reorder_optimization'
                            ]
                        },
                        {
                            name: 'Market Analyst',
                            type: client_1.AgentType.MARKET_ANALYSIS,
                            description: 'Analyzes market trends and opportunities',
                            departmentId: departments[2].id,
                            capabilities: [
                                'market_analysis',
                                'trend_tracking',
                                'competitor_monitoring'
                            ]
                        }
                    ];
                    _i = 0, coreAgents_1 = coreAgents;
                    _a.label = 3;
                case 3:
                    if (!(_i < coreAgents_1.length)) return [3 /*break*/, 9];
                    agent = coreAgents_1[_i];
                    return [4 /*yield*/, prisma.agent.findFirst({
                            where: { type: agent.type }
                        })];
                case 4:
                    existing = _a.sent();
                    if (!!existing) return [3 /*break*/, 7];
                    return [4 /*yield*/, prisma.agent.create({
                            data: __assign(__assign({}, agent), { status: client_1.AgentStatus.AVAILABLE })
                        })];
                case 5:
                    created = _a.sent();
                    // Initialize metrics
                    return [4 /*yield*/, prisma.agentMetrics.create({
                            data: {
                                agentId: created.id,
                                totalInteractions: 0,
                                successfulInteractions: 0,
                                averageResponseTime: 0,
                                errorRate: 0,
                                lastActive: new Date()
                            }
                        })];
                case 6:
                    // Initialize metrics
                    _a.sent();
                    console.log("Created agent: ".concat(created.name));
                    return [3 /*break*/, 8];
                case 7:
                    console.log("Agent already exists: ".concat(agent.name));
                    _a.label = 8;
                case 8:
                    _i++;
                    return [3 /*break*/, 3];
                case 9:
                    console.log('Agent system initialization complete');
                    return [3 /*break*/, 11];
                case 10:
                    error_1 = _a.sent();
                    console.error('Failed to initialize agent system:', error_1);
                    throw error_1;
                case 11: return [2 /*return*/];
            }
        });
    });
}
// Run initialization
initializeAgentSystem()["catch"](console.error)["finally"](function () { return prisma.$disconnect(); });
