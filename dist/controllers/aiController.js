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
exports.AIController = void 0;
/**
 * Controller class for handling AI-related operations
 */
class AIController {
    /**
     * Initializes a new instance of AIController
     * @param aiService - AI service for processing operations
     */
    constructor(aiService) {
        this.aiService = aiService;
    }
    /**
     * Processes a user prompt through the complete AI workflow
     * First attempts to process as simple CRUD operations
     * If needed, escalates to financial analysis
     * @param req - Express request object
     * @param res - Express response object
     */
    processPrompt(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { prompt } = req.body;
                if (!prompt) {
                    res.status(400).json({ error: "Missing prompt" });
                    return;
                }
                // First, process the prompt for CRUD operations
                const crudResponse = yield this.aiService.processCrudOperations(prompt);
                // Check if we need to escalate to financial analysis
                const shouldEscalate = crudResponse.actions.length === 1 &&
                    crudResponse.actions[0].type === "respond" &&
                    crudResponse.actions[0].message &&
                    (crudResponse.actions[0].message.includes("requires financial analysis") ||
                        crudResponse.actions[0].message.includes("need more information") ||
                        crudResponse.actions[0].message.includes("current financial situation") ||
                        prompt.toLowerCase().includes("do i have") ||
                        prompt.toLowerCase().includes("should i buy") ||
                        prompt.toLowerCase().includes("afford") ||
                        prompt.toLowerCase().includes("budget") ||
                        prompt.toLowerCase().includes("advice"));
                if (shouldEscalate) {
                    console.log("Escalating to financial analysis:", prompt);
                    // Call the financial analysis function
                    const analysisResponse = yield this.aiService.processFinancialAnalysis(prompt);
                    // Execute the actions and get the response
                    const responseMessage = yield this.aiService.executeActions(analysisResponse.actions);
                    // Return the response
                    res.json({
                        success: true,
                        message: responseMessage,
                        actions: analysisResponse.actions
                    });
                    return;
                }
                // Execute the CRUD actions and get the response
                const responseMessage = yield this.aiService.executeActions(crudResponse.actions);
                // Return the response
                res.json({
                    success: true,
                    message: responseMessage,
                    actions: crudResponse.actions
                });
            }
            catch (error) {
                console.error("Error processing AI request:", error);
                res.status(500).json({
                    error: "Failed to process AI request",
                    details: error instanceof Error ? error.message : String(error)
                });
            }
        });
    }
}
exports.AIController = AIController;
