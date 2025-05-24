"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = setupSwagger;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const path_1 = __importDefault(require("path"));
/**
 * Swagger configuration options
 */
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "AERI API Documentation",
            version: process.env.npm_package_version || "1.0.0",
            description: "API documentation for AERI Server",
            contact: {
                name: "API Support",
                email: "support@example.com"
            }
        },
        servers: [
            {
                url: "http://localhost:8000",
                description: "Development server"
            }
        ],
        components: {
            schemas: {
                HealthResponse: {
                    type: "object",
                    properties: {
                        status: {
                            type: "string",
                            example: "healthy"
                        },
                        timestamp: {
                            type: "string",
                            format: "date-time",
                            example: "2023-06-14T12:00:00Z"
                        }
                    }
                },
                AIPromptRequest: {
                    type: "object",
                    required: ["prompt"],
                    properties: {
                        prompt: {
                            type: "string",
                            example: "Can you analyze the financial health of Tesla?"
                        }
                    }
                },
                AIPromptResponse: {
                    type: "object",
                    properties: {
                        response: {
                            type: "string",
                            example: "Based on current financial data, Tesla shows strong revenue growth..."
                        }
                    }
                },
                Error: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string"
                        },
                        status: {
                            type: "number"
                        }
                    }
                }
            }
        }
    },
    apis: [
        path_1.default.resolve(__dirname, "../routes/*.ts"),
        path_1.default.resolve(__dirname, "../server.ts")
    ]
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
/**
 * Configures Swagger UI for API documentation
 * @param app - Express application instance
 */
function setupSwagger(app) {
    // Serve Swagger documentation UI
    app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
    // Serve Swagger JSON
    app.get("/api-spec", (req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerSpec);
    });
    console.log("Swagger documentation available at /api-docs");
}
