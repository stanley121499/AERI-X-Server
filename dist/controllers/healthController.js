"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
/**
 * Controller class for handling health-related endpoints
 */
class HealthController {
    /**
     * Returns health status of the application
     * @param req - Express request object
     * @param res - Express response object
     */
    getHealthStatus(req, res) {
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
exports.HealthController = HealthController;
