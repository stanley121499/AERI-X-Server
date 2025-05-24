import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import path from "path";

/**
 * Swagger configuration options
 */
const swaggerOptions: swaggerJSDoc.Options = {
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
    path.resolve(__dirname, "../routes/*.ts"),
    path.resolve(__dirname, "../server.ts")
  ]
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

/**
 * Configures Swagger UI for API documentation
 * @param app - Express application instance
 */
export function setupSwagger(app: Express): void {
  // Serve Swagger documentation UI
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  
  // Serve Swagger JSON
  app.get("/api-spec", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
  
  console.log("Swagger documentation available at /api-docs");
} 