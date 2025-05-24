import { Router } from "express";
import { AIController } from "../controllers/aiController";
import { AIService } from "../services/aiService";
import OpenAI from "openai";

/**
 * Creates and configures routes for AI functionality
 * @param openaiClient - OpenAI client for API calls
 * @returns Configured router
 */
export function createAIRoutes(openaiClient: OpenAI): Router {
  const router = Router();
  const aiService = new AIService(openaiClient);
  const aiController = new AIController(aiService);
  
  /**
   * @swagger
   * /ai:
   *   post:
   *     summary: Process AI prompt
   *     description: Sends a prompt to the AI engine and returns the response. Can include conversation history for context.
   *     tags: [AI]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - prompt
   *             properties:
   *               prompt:
   *                 type: string
   *                 description: The prompt to send to the AI
   *               conversationHistory:
   *                 type: array
   *                 description: Previous messages in the conversation
   *                 items:
   *                   type: object
   *                   required:
   *                     - role
   *                     - content
   *                   properties:
   *                     role:
   *                       type: string
   *                       enum: [user, assistant, system]
   *                       description: The role of the message sender
   *                     content:
   *                       type: string
   *                       description: The content of the message
   *     responses:
   *       200:
   *         description: AI-generated response
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   description: Whether the operation was successful
   *                 message:
   *                   type: string
   *                   description: The main response message
   *                 actions:
   *                   type: array
   *                   description: List of actions taken by the AI
   *                   items:
   *                     type: object
   *                 conversationHistory:
   *                   type: array
   *                   description: Updated conversation history including this interaction
   *                   items:
   *                     type: object
   *                     properties:
   *                       role:
   *                         type: string
   *                         enum: [user, assistant, system]
   *                       content:
   *                         type: string
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