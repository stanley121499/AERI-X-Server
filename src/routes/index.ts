import { Router } from "express";
import { createHealthRoutes } from "./healthRoutes";
import { createAIRoutes } from "./aiRoutes";
import OpenAI from "openai";

/**
 * Configures all application routes
 * @param openaiClient - OpenAI client for API calls
 * @returns Configured router with all application routes
 */
export function configureRoutes(openaiClient: OpenAI): Router {
  const router = Router();
  
  // Configure and mount routes for different features
  router.use("/health", createHealthRoutes());
  router.use("/ai", createAIRoutes(openaiClient));
  
  /**
   * @swagger
   * /:
   *   get:
   *     summary: API information
   *     description: Returns basic information about the API and available endpoints
   *     tags: [Info]
   *     responses:
   *       200:
   *         description: API information
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "AERI API Server"
   *                 version:
   *                   type: string
   *                   example: "1.0.0"
   *                 endpoints:
   *                   type: array
   *                   items:
   *                     type: string
   *                   example:
   *                     - "/health - Health check endpoint"
   *                     - "/ai - AI-powered financial assistant"
   */
  router.get("/", (req, res) => {
    res.json({
      message: "AERI API Server",
      version: process.env.npm_package_version || "1.0.0",
      endpoints: [
        "/health - Health check endpoint",
        "/ai - AI-powered financial assistant"
      ]
    });
  });
  
  return router;
} 