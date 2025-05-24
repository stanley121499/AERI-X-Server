"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = notFoundHandler;
exports.errorHandler = errorHandler;
/**
 * Middleware for handling route not found errors (404)
 * @param req - Express request object
 * @param res - Express response object
 */
function notFoundHandler(req, res) {
    res.status(404).json({
        error: {
            message: `Not Found - ${req.method} ${req.originalUrl}`
        }
    });
}
/**
 * Middleware for handling application errors
 * @param err - Error object
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function errorHandler(err, req, res, 
// Including next parameter is required by Express for error middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
next) {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error(`Error [${statusCode}]: ${message}`, err.details || "");
    res.status(statusCode).json({
        error: {
            message,
            details: process.env.NODE_ENV === "development" ? err.details : undefined
        }
    });
}
