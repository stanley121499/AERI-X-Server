import { Request, Response } from "express";
import { AIService, ConversationMessage } from "../services/aiService";

/**
 * Interface for the request body of AI-powered operations
 */
export interface AIRequest {
  prompt: string;
  conversationHistory?: ConversationMessage[];
}

/**
 * Controller class for handling AI-related operations
 */
export class AIController {
  private aiService: AIService;

  /**
   * Initializes a new instance of AIController
   * @param aiService - AI service for processing operations
   */
  constructor(aiService: AIService) {
    this.aiService = aiService;
  }

  /**
   * Processes a user prompt through the complete AI workflow
   * First attempts to process as simple CRUD operations
   * If needed, escalates to financial analysis
   * @param req - Express request object
   * @param res - Express response object
   */
  public async processPrompt(req: Request, res: Response): Promise<void> {
    try {
      const { prompt, conversationHistory = [] } = req.body as AIRequest;

      if (!prompt) {
        res.status(400).json({ error: "Missing prompt" });
        return;
      }

      // First, process the prompt for CRUD operations
      const crudResponse = await this.aiService.processCrudOperations(prompt, conversationHistory);
      
      // Check if we need to escalate to financial analysis
      const shouldEscalate = 
        crudResponse.actions.length === 1 && 
        crudResponse.actions[0].type === "respond" &&
        crudResponse.actions[0].message && 
        (
          crudResponse.actions[0].message.includes("requires financial analysis") ||
          crudResponse.actions[0].message.includes("need more information") ||
          crudResponse.actions[0].message.includes("current financial situation") ||
          prompt.toLowerCase().includes("do i have") || 
          prompt.toLowerCase().includes("should i buy") ||
          prompt.toLowerCase().includes("afford") ||
          prompt.toLowerCase().includes("budget") ||
          prompt.toLowerCase().includes("advice")
        );
      
      if (shouldEscalate) {
        console.log("Escalating to financial analysis:", prompt);
        
        // Call the financial analysis function
        const analysisResponse = await this.aiService.processFinancialAnalysis(prompt, conversationHistory);
        
        // Execute the actions and get the response
        const responseMessage = await this.aiService.executeActions(analysisResponse.actions);
        
        // Add the assistant's response to the conversation history
        const updatedHistory = [
          ...conversationHistory,
          { role: "user", content: prompt },
          { role: "assistant", content: responseMessage }
        ];
        
        // Return the response
        res.json({
          success: true,
          message: responseMessage,
          actions: analysisResponse.actions,
          conversationHistory: updatedHistory
        });
        return;
      }
      
      // Execute the CRUD actions and get the response
      const responseMessage = await this.aiService.executeActions(crudResponse.actions);
      
      // Add the assistant's response to the conversation history
      const updatedHistory = [
        ...conversationHistory,
        { role: "user", content: prompt },
        { role: "assistant", content: responseMessage }
      ];
      
      // Return the response
      res.json({
        success: true,
        message: responseMessage,
        actions: crudResponse.actions,
        conversationHistory: updatedHistory
      });
    } catch (error) {
      console.error("Error processing AI request:", error);
      res.status(500).json({ 
        error: "Failed to process AI request",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  }
} 