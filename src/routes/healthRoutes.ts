import { Router } from "express";
import { HealthController } from "../controllers/healthController";

/**
 * Creates and configures routes for health check functionality
 * @returns Configured router
 */
export function createHealthRoutes(): Router {
  const router = Router();
  const healthController = new HealthController();
  
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