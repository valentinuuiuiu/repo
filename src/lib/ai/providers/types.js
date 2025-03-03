"use strict";
exports.__esModule = true;
exports.ModelProvider = exports.ModelType = void 0;
var ModelType;
(function (ModelType) {
    ModelType["CHAT"] = "Chat";
    ModelType["EMBEDDING"] = "Embedding";
})(ModelType = exports.ModelType || (exports.ModelType = {}));
var ModelProvider;
(function (ModelProvider) {
    ModelProvider["ANTHROPIC"] = "Anthropic";
    ModelProvider["DEEPSEEK"] = "DeepSeek";
    ModelProvider["GOOGLE"] = "Google";
    ModelProvider["GROQ"] = "Groq";
    ModelProvider["HUGGINGFACE"] = "HuggingFace";
    ModelProvider["LMSTUDIO"] = "LM Studio";
    ModelProvider["MISTRALAI"] = "Mistral AI";
    ModelProvider["OLLAMA"] = "Ollama";
    ModelProvider["OPENAI"] = "OpenAI";
    ModelProvider["OPENAI_AZURE"] = "OpenAI Azure";
    ModelProvider["OPENROUTER"] = "OpenRouter";
    ModelProvider["SAMBANOVA"] = "Sambanova";
    ModelProvider["OTHER"] = "Other";
})(ModelProvider = exports.ModelProvider || (exports.ModelProvider = {}));
