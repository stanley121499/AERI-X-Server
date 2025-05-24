import express from "express";
import * as dotenv from "dotenv";
import OpenAI from "openai";
import cors from "cors";
import { configureRoutes } from "./routes";
import { notFoundHandler, errorHandler } from "./middlewares/errorMiddleware";
import { setupSwagger } from "./utils/swagger";

// Load environment variables
dotenv.config();

// Initialize Express application
const app = express();
const port = process.env.PORT || 8000;

// Verify OpenAI API key
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error("Missing OpenAI API key");
  process.exit(1);
}

// Initialize OpenAI client
const openaiClient = new OpenAI({
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
app.use(express.json());
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Handle preflight requests

// Setup Swagger documentation
setupSwagger(app);

// Mount routes
app.use("/", configureRoutes(openaiClient));

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Available routes:`);
  console.log(`- http://localhost:${port}/health`);
  console.log(`- http://localhost:${port}/ai`);
  console.log(`- http://localhost:${port}/api-docs (Swagger Documentation)`);
  console.log(`- http://localhost:${port}/api-spec (Swagger JSON)`);
});
