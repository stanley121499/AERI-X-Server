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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFineTunedChat = getFineTunedChat;
/**
 * Gets chat completions from a fine-tuned model
 * @param client - OpenAI client instance
 * @param modelId - The ID of the fine-tuned model
 * @param prompt - The user's prompt
 * @param systemPrompt - Optional system prompt to provide context
 * @param messages - Optional previous messages for conversation context
 * @returns The chat completion
 */
function getFineTunedChat(client, modelId, prompt, systemPrompt, messages) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const messagePayload = [
                {
                    role: "system",
                    content: systemPrompt || "You are a helpful assistant.",
                },
            ];
            // Add previous messages if provided
            if (messages && messages.length > 0) {
                // Need to ensure role is one of the valid types for OpenAI
                messages.forEach((msg) => {
                    if (["system", "user", "assistant"].includes(msg.role)) {
                        messagePayload.push({
                            role: msg.role,
                            content: msg.content,
                        });
                    }
                });
            }
            // Add the current user prompt
            messagePayload.push({
                role: "user",
                content: prompt,
            });
            const response = yield client.chat.completions.create({
                model: modelId,
                messages: messagePayload,
            });
            return ((_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) || { content: "" };
        }
        catch (error) {
            console.error("Error in getting fine-tuned chat:", error);
            throw error;
        }
    });
}
