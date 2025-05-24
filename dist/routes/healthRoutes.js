"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHealthRoutes = createHealthRoutes;
const express_1 = require("express");
const healthController_1 = require("../controllers/healthController");
/**
 * Creates and configures routes for health check functionality
 * @returns Configured router
 */
function createHealthRoutes() {
    const router = (0, express_1.Router)();
    const healthController = new healthController_1.HealthController();
    /**
     * @swagger
     * /health:
     *   get:
     *     summary: Get system health status
     *     description: Returns the current health status of the API
     *     tags: [Health]
     *     responses:
     *       200:
     *         description: Health status information
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HealthResponse'
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    router.get("/", (req, res) => healthController.getHealthStatus(req, res));
    return router;
}
