"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureRoutes = configureRoutes;
const express_1 = require("express");
const healthRoutes_1 = require("./healthRoutes");
const aiRoutes_1 = require("./aiRoutes");
/**
 * Configures all application routes
 * @param openaiClient - OpenAI client for API calls
 * @returns Configured router with all application routes
 */
function configureRoutes(openaiClient) {
    const router = (0, express_1.Router)();
    // Configure and mount routes for different features
    router.use("/health", (0, healthRoutes_1.createHealthRoutes)());
    router.use("/ai", (0, aiRoutes_1.createAIRoutes)(openaiClient));
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
