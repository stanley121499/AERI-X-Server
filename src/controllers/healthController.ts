import { Request, Response } from "express";

/**
 * Controller class for handling health-related endpoints
 */
export class HealthController {
  /**
   * Returns health status of the application
   * @param req - Express request object
   * @param res - Express response object
   */
  public getHealthStatus(req: Request, res: Response): void {
    res.status(200).json({
      status: "UP",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0",
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      environment: process.env.NODE_ENV || "development"
    });
  }
} 