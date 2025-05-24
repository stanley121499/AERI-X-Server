"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv = __importStar(require("dotenv"));
const openai_1 = __importDefault(require("openai"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = require("./routes");
const errorMiddleware_1 = require("./middlewares/errorMiddleware");
const swagger_1 = require("./utils/swagger");
// Load environment variables
dotenv.config();
// Initialize Express application
const app = (0, express_1.default)();
const port = process.env.PORT || 8000;
// Verify OpenAI API key
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
    console.error("Missing OpenAI API key");
    process.exit(1);
}
// Initialize OpenAI client
const openaiClient = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY
});
// Configure CORS options
const corsOptions = {
    origin: "*", // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed methods
    allowedHeaders: [
        "Origin",
        "X-Requested-With",
        "Content-Type",
        "Accept",
        "Authorization",
    ], // Allowed headers
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
};
// Apply middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)(corsOptions));
app.options("*", (0, cors_1.default)(corsOptions)); // Handle preflight requests
// Setup Swagger documentation
(0, swagger_1.setupSwagger)(app);
// Mount routes
app.use("/", (0, routes_1.configureRoutes)(openaiClient));
// Error handling middleware
app.use(errorMiddleware_1.notFoundHandler);
app.use(errorMiddleware_1.errorHandler);
// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log(`Available routes:`);
    console.log(`- http://localhost:${port}/health`);
    console.log(`- http://localhost:${port}/ai`);
    console.log(`- http://localhost:${port}/api-docs (Swagger Documentation)`);
    console.log(`- http://localhost:${port}/api-spec (Swagger JSON)`);
});
