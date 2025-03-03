"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentFunctionType = exports.AgentType = exports.AgentStatus = void 0;
var AgentStatus;
(function (AgentStatus) {
    AgentStatus["IDLE"] = "idle";
    AgentStatus["CONNECTING"] = "connecting";
    AgentStatus["CONNECTED"] = "connected";
    AgentStatus["PROCESSING"] = "processing";
    AgentStatus["DISCONNECTING"] = "disconnecting";
    AgentStatus["ERROR"] = "error";
})(AgentStatus || (exports.AgentStatus = AgentStatus = {}));
var AgentType;
(function (AgentType) {
    AgentType["CUSTOMER_SERVICE"] = "CUSTOMER_SERVICE";
    AgentType["INVENTORY_MANAGEMENT"] = "INVENTORY_MANAGEMENT";
    AgentType["PRICING_OPTIMIZATION"] = "PRICING_OPTIMIZATION";
    AgentType["SUPPLIER_COMMUNICATION"] = "SUPPLIER_COMMUNICATION";
    AgentType["MARKET_ANALYSIS"] = "MARKET_ANALYSIS";
    AgentType["ORDER_PROCESSING"] = "ORDER_PROCESSING";
    AgentType["QUALITY_CONTROL"] = "QUALITY_CONTROL";
    AgentType["CODE_MAINTENANCE"] = "CODE_MAINTENANCE";
    AgentType["PRODUCT_LEADER"] = "PRODUCT_LEADER";
})(AgentType || (exports.AgentType = AgentType = {}));
// New enum for agent function types
var AgentFunctionType;
(function (AgentFunctionType) {
    AgentFunctionType["DATA_ANALYSIS"] = "DATA_ANALYSIS";
    AgentFunctionType["REPORT_GENERATION"] = "REPORT_GENERATION";
    AgentFunctionType["SUMMARIZATION"] = "SUMMARIZATION";
    AgentFunctionType["CONTENT_CREATION"] = "CONTENT_CREATION";
    AgentFunctionType["SENTIMENT_ANALYSIS"] = "SENTIMENT_ANALYSIS";
    AgentFunctionType["MARKET_RESEARCH"] = "MARKET_RESEARCH";
    AgentFunctionType["CUSTOMER_INTERACTION"] = "CUSTOMER_INTERACTION";
    AgentFunctionType["PROCESS_OPTIMIZATION"] = "PROCESS_OPTIMIZATION";
    AgentFunctionType["DOCUMENTATION_CREATION"] = "DOCUMENTATION_CREATION";
    AgentFunctionType["SEO_OPTIMIZATION"] = "SEO_OPTIMIZATION";
    AgentFunctionType["CROSS_PLATFORM_ANALYSIS"] = "CROSS_PLATFORM_ANALYSIS";
})(AgentFunctionType || (exports.AgentFunctionType = AgentFunctionType = {}));
