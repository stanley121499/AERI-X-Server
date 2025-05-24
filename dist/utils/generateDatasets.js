"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDataSetsInChunks = generateDataSetsInChunks;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Generates training datasets in chunks from a file URL
 * @param client - OpenAI client instance
 * @param fileUrl - URL of the file to process
 * @param breadth - Optional training breadth parameter
 * @param depth - Optional training depth parameter
 * @returns The generated datasets
 */
function generateDataSetsInChunks(client, fileUrl, breadth, depth) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Create datasets directory if it doesn't exist
            const datasetsDir = path_1.default.join(process.cwd(), "dist", "datasets");
            if (!fs_1.default.existsSync(datasetsDir)) {
                fs_1.default.mkdirSync(datasetsDir, { recursive: true });
            }
            // Path to the output file
            const outputPath = path_1.default.join(datasetsDir, "generated_dataset.jsonl");
            // Extract content from the file URL
            // In a real implementation, you would fetch and process the file
            // This is a simplified placeholder
            const datasets = [
                {
                    messages: [
                        { role: "system", content: "You are a helpful assistant." },
                        { role: "user", content: "Sample question from the document" },
                        { role: "assistant", content: "Sample answer based on the document" },
                    ],
                },
            ];
            // Write datasets to JSONL file
            datasets.forEach((dataset) => {
                fs_1.default.appendFileSync(outputPath, JSON.stringify(dataset) + "\n", "utf8");
            });
            return datasets;
        }
        catch (error) {
            console.error("Error in generating datasets:", error);
            throw error;
        }
    });
}
