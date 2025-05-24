"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAIRoutes = createAIRoutes;
const express_1 = require("express");
const aiController_1 = require("../controllers/aiController");
const aiService_1 = require("../services/aiService");
/**
 * Creates and configures routes for AI functionality
 * @param openaiClient - OpenAI client for API calls
 * @returns Configured router
 */
function createAIRoutes(openaiClient) {
    const router = (0, express_1.Router)();
    const aiService = new aiService_1.AIService(openaiClient);
    const aiController = new aiController_1.AIController(aiService);
    /**
     * @swagger
     * /ai:
     *   post:
     *     summary: Process AI prompt
     *     description: Sends a prompt to the AI engine and returns the response
     *     tags: [AI]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/AIPromptRequest'
     *     responses:
     *       200:
     *         description: AI-generated response
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/AIPromptResponse'
     *       400:
     *         description: Bad request - missing or invalid prompt
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Server error or AI service error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    router.post("/", (req, res) => aiController.processPrompt(req, res));
    return router;
}
