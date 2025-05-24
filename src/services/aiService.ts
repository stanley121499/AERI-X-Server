import OpenAI from "openai";
import { Database } from "../database.types";
import { 
  fetchAllWallets,
  fetchWalletByName,
  createWallet
} from "../db/wallets";
import { 
  fetchAllWalletBalances 
} from "../db/wallet_balances";
import { 
  fetchAllTransactionCategories,
  createTransactionCategory
} from "../db/transaction_categories";
import { 
  fetchAllTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction
} from "../db/transactions";
import { 
  fetchAllFinancialNotes,
  createFinancialNote,
  updateFinancialNote,
  deleteFinancialNote
} from "../db/financial_notes";

/**
 * Action types for CRUD operations
 */
export enum ActionType {
  CREATE_TRANSACTION = "create_transaction",
  UPDATE_TRANSACTION = "update_transaction",
  DELETE_TRANSACTION = "delete_transaction",
  CREATE_CATEGORY = "create_category",
  CREATE_NOTE = "create_note",
  UPDATE_NOTE = "update_note",
  DELETE_NOTE = "delete_note",
  RESPOND = "respond"
}

/**
 * Interface for AI response actions
 */
export interface AIAction {
  type: ActionType;
  data: any;
  message?: string;
}

/**
 * Interface for the response from AI models
 */
export interface AIModelResponse {
  actions: AIAction[];
}

/**
 * Interface for a conversation message
 */
export interface ConversationMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

/**
 * AI Service class for handling AI model interactions
 */
export class AIService {
  private openaiClient: OpenAI;

  /**
   * Initializes the AI Service
   * @param openaiClient - OpenAI client instance
   */
  constructor(openaiClient: OpenAI) {
    this.openaiClient = openaiClient;
  }

  /**
   * Process CRUD operations based on user prompt
   * @param prompt - User input prompt
   * @param conversationHistory - Previous conversation messages (optional)
   * @returns AI model response with actions
   */
  public async processCrudOperations(
    prompt: string, 
    conversationHistory: ConversationMessage[] = []
  ): Promise<AIModelResponse> {
    // Get all transaction categories for context
    const categories = await fetchAllTransactionCategories();
    
    // Build a prompt for the AI model
    const systemPrompt = this.buildCrudSystemPrompt(categories);
    
    // Prepare messages for the API call, including conversation history
    const messages = [
      {
        role: "system" as const,
        content: systemPrompt,
      },
      ...conversationHistory,
      {
        role: "user" as const,
        content: prompt,
      },
    ];
    
    // Call OpenAI API
    const completion = await this.openaiClient.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      messages,
      response_format: { type: "json_object" }
    });

    // Parse the response as JSON
    const responseContent = completion.choices[0].message.content || "{}";
    try {
      const parsedResponse = JSON.parse(responseContent) as AIModelResponse;
      return parsedResponse;
    } catch (error) {
      console.error("Failed to parse AI response:", error);
      return {
        actions: [
          {
            type: ActionType.RESPOND,
            data: null,
            message: "I'm sorry, but I couldn't process your request correctly. Please try again with more details."
          }
        ]
      };
    }
  }

  /**
   * Process financial analysis based on user prompt and database data
   * @param prompt - User input prompt
   * @param conversationHistory - Previous conversation messages (optional)
   * @returns AI model response with actions
   */
  public async processFinancialAnalysis(
    prompt: string,
    conversationHistory: ConversationMessage[] = []
  ): Promise<AIModelResponse> {
    // Fetch all necessary data for comprehensive analysis
    const wallets = await fetchAllWallets();
    const balances = await fetchAllWalletBalances();
    const categories = await fetchAllTransactionCategories();
    const transactions = await fetchAllTransactions();
    const notes = await fetchAllFinancialNotes();
    
    // Extract and highlight important financial details from conversation history
    const extractedDetails = this.extractFinancialDetailsFromHistory(conversationHistory);
    
    // Build a prompt for the AI model
    const systemPrompt = this.buildAnalysisSystemPrompt({
      wallets,
      walletBalances: balances,
      categories,
      transactions,
      financialNotes: notes,
      extractedDetails
    });
    
    // Prepare messages for the API call, including conversation history
    const messages = [
      {
        role: "system" as const,
        content: systemPrompt,
      },
      ...conversationHistory,
      {
        role: "user" as const,
        content: prompt,
      },
    ];
    
    // Call OpenAI API
    const completion = await this.openaiClient.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      messages,
      response_format: { type: "json_object" }
    });

    // Parse the response as JSON
    const responseContent = completion.choices[0].message.content || "{}";
    try {
      const parsedResponse = JSON.parse(responseContent) as AIModelResponse;
      return parsedResponse;
    } catch (error) {
      console.error("Failed to parse AI response:", error);
      return {
        actions: [
          {
            type: ActionType.RESPOND,
            data: null,
            message: "I'm sorry, but I couldn't complete the financial analysis. Please try again with more specific information."
          }
        ]
      };
    }
  }

  /**
   * Extract important financial details from conversation history
   * @param conversationHistory - Previous conversation messages
   * @returns String of extracted financial details
   */
  private extractFinancialDetailsFromHistory(conversationHistory: ConversationMessage[]): string {
    if (!conversationHistory || conversationHistory.length === 0) {
      return "";
    }
    
    // Keywords and patterns to look for
    const financialPatterns = [
      // Income patterns
      { pattern: /salary|income|earn|pay(check|day)|get paid/i, category: "Income" },
      { pattern: /(day|date|every|each|[0-9]+)(st|nd|rd|th)? (of )?(\w+ )?(month|week|fortnight|bi-weekly)/i, category: "Payment Schedule" },
      { pattern: /[0-9]+(?:st|nd|rd|th)?(?=\s+(?:of\s+)?(?:january|february|march|april|may|june|july|august|september|october|november|december))/i, category: "Payment Date" },
      { pattern: /(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+[0-9]+(?:st|nd|rd|th)?/i, category: "Payment Date" },
      
      // Expense patterns
      { pattern: /rent|mortgage|bill|subscription|payment/i, category: "Recurring Expense" },
      { pattern: /due (date|on)|deadline|by the/i, category: "Payment Deadline" },
      
      // Financial goals
      { pattern: /save|saving|budget|goal|target|plan/i, category: "Financial Goal" },
      
      // Financial constraints
      { pattern: /debt|loan|credit|owe|borrow/i, category: "Debt" },
      { pattern: /limit|restrict|cut( down)?|reduce/i, category: "Spending Constraint" }
    ];
    
    // Extract relevant financial information from conversation
    let extractedDetails = "IMPORTANT FINANCIAL DETAILS FROM CONVERSATION:\n";
    let detailsFound = false;
    
    conversationHistory.forEach((message, index) => {
      if (message.role === "user") {
        // Check for financial patterns in user messages
        const matches = financialPatterns.filter(pattern => 
          pattern.pattern.test(message.content)
        );
        
        if (matches.length > 0) {
          detailsFound = true;
          extractedDetails += `- User mentioned: "${message.content}"\n`;
          extractedDetails += `  Categories: ${matches.map(m => m.category).join(", ")}\n`;
          
          // If we have an assistant response following this, include it for context
          if (index + 1 < conversationHistory.length && conversationHistory[index + 1].role === "assistant") {
            extractedDetails += `  Your response: "${conversationHistory[index + 1].content.substring(0, 100)}..."\n`;
          }
          
          extractedDetails += "\n";
        }
      }
    });
    
    return detailsFound ? extractedDetails : "";
  }

  /**
   * Execute actions returned by the AI model
   * @param actions - List of actions to execute
   * @returns Response message to send back to the user
   */
  public async executeActions(actions: AIAction[]): Promise<string> {
    const responses: string[] = [];
    
    // Process all actions
    for (const action of actions) {
      try {
        switch (action.type) {
          case ActionType.CREATE_TRANSACTION:
            // Handle category_name field by finding or creating the category
            if (action.data.category_name && typeof action.data.category_name === "string") {
              // Get all categories to check for a match
              const categories = await fetchAllTransactionCategories();
              
              // Check if we already have a category with this name
              const matchingCategory = categories.find(
                cat => cat.name.toLowerCase() === action.data.category_name.toLowerCase()
              );
              
              if (matchingCategory) {
                // Use the existing category's ID
                action.data.category_id = matchingCategory.id;
                console.log(`Using existing category "${matchingCategory.name}" with ID: ${matchingCategory.id}`);
              } else {
                // Create a new category with this name
                const newCategory = await createTransactionCategory({
                  name: action.data.category_name,
                  type: action.data.type, // Use the same type as the transaction
                  description: `Automatically created for the transaction: "${action.data.description}"`
                });
                
                // Use the new category's ID
                action.data.category_id = newCategory.id;
                console.log(`Created new category "${newCategory.name}" with ID: ${newCategory.id}`);
                responses.push(`Created a new category: ${newCategory.name}`);
              }
              
              // Remove the category_name field as it's not needed anymore
              delete action.data.category_name;
            }
            
            // Handle wallet_name field by finding the wallet - don't create if not found
            if (action.data.wallet_name && typeof action.data.wallet_name === "string") {
              // Try to find an existing wallet with this name
              const existingWallet = await fetchWalletByName(action.data.wallet_name);
              
              if (existingWallet) {
                // Use the existing wallet's ID
                action.data.wallet_id = existingWallet.id;
                console.log(`Using existing wallet "${existingWallet.name}" with ID: ${existingWallet.id}`);
              } else {
                // Throw error instead of creating a new wallet
                throw new Error(`Wallet with name "${action.data.wallet_name}" not found. Please create the wallet first.`);
              }
              
              // Remove the wallet_name field as it's not needed anymore
              delete action.data.wallet_name;
            }
            
            // Validate wallet_id is present and a valid UUID
            if (!action.data.wallet_id) {
              // Throw error if no wallet_id was provided
              throw new Error("A valid wallet_id must be provided for this transaction. Please specify an existing wallet.");
            } else if (typeof action.data.wallet_id === "string") {
              const walletUuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
              if (!walletUuidRegex.test(action.data.wallet_id)) {
                // Throw error for non-UUID wallet_id instead of creating a wallet
                throw new Error(`Invalid UUID format for wallet_id: ${action.data.wallet_id}. Please specify a valid wallet ID.`);
              }
            }
            
            // Validate transaction type
            if (action.data.type !== "in" && action.data.type !== "out") {
              throw new Error(`Invalid transaction type: ${action.data.type}. Must be 'in' or 'out'`);
            }
            
            // Validate amount
            if (typeof action.data.amount !== "number") {
              throw new Error(`Invalid amount: ${action.data.amount}. Must be a number`);
            }
            
            // Handle any non-UUID category_id as a fallback
            if (action.data.category_id && typeof action.data.category_id === "string") {
              const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
              if (!uuidRegex.test(action.data.category_id)) {
                // Try to create a category from the invalid ID as a last resort
                const categoryName = action.data.category_id
                  .replace(/_/g, ' ')
                  .replace(/category/i, '')
                  .replace(/id/i, '')
                  .trim()
                  .replace(/^\w/, (c: string) => c.toUpperCase());
                
                const newCategory = await createTransactionCategory({
                  name: categoryName || "Miscellaneous",
                  type: action.data.type,
                  description: "Automatically created from ID placeholder"
                });
                
                action.data.category_id = newCategory.id;
                responses.push(`Created a new category: ${newCategory.name}`);
              }
            }
            
            await createTransaction(action.data);
            responses.push(action.message || "Transaction created successfully.");
            break;
            
          case ActionType.UPDATE_TRANSACTION:
            await updateTransaction(action.data.id, action.data);
            responses.push(action.message || "Transaction updated successfully.");
            break;
            
          case ActionType.DELETE_TRANSACTION:
            await deleteTransaction(action.data.id);
            responses.push(action.message || "Transaction deleted successfully.");
            break;
            
          case ActionType.CREATE_CATEGORY:
            // Validate category type
            if (action.data.type !== "in" && action.data.type !== "out") {
              throw new Error(`Invalid category type: ${action.data.type}. Must be 'in' or 'out'`);
            }
            
            // Validate category name
            if (!action.data.name || typeof action.data.name !== "string" || action.data.name.trim() === "") {
              throw new Error("Category name is required and must be a non-empty string");
            }
            
            const newCategory = await createTransactionCategory(action.data);
            responses.push(action.message || "Category created successfully.");
            break;
            
          case ActionType.CREATE_NOTE:
            // Validate the note field is present
            if (!action.data.note || typeof action.data.note !== "string" || action.data.note.trim() === "") {
              throw new Error("Note content is required and must be a non-empty string");
            }
            
            // Handle related_category_id by name if provided as a string that isn't a UUID
            if (action.data.related_category_name && typeof action.data.related_category_name === "string") {
              const categories = await fetchAllTransactionCategories();
              const matchingCategory = categories.find(
                cat => cat.name.toLowerCase() === action.data.related_category_name.toLowerCase()
              );
              
              if (matchingCategory) {
                action.data.related_category_id = matchingCategory.id;
                console.log(`Using existing category "${matchingCategory.name}" for note relation`);
              }
              
              // Remove the field as it's not part of the DB schema
              delete action.data.related_category_name;
            }
            
            // Handle related_wallet_id by name if provided
            if (action.data.related_wallet_name && typeof action.data.related_wallet_name === "string") {
              const existingWallet = await fetchWalletByName(action.data.related_wallet_name);
              
              if (existingWallet) {
                action.data.related_wallet_id = existingWallet.id;
                console.log(`Using existing wallet "${existingWallet.name}" for note relation`);
              }
              
              // Remove the field as it's not part of the DB schema
              delete action.data.related_wallet_name;
            }
            
            // Create the note with the data
            await createFinancialNote(action.data);
            console.log("Financial note created:", action.data.note);
            responses.push(action.message || "Financial note created successfully.");
            break;
            
          case ActionType.UPDATE_NOTE:
            await updateFinancialNote(action.data.id, action.data);
            responses.push(action.message || "Financial note updated successfully.");
            break;
            
          case ActionType.DELETE_NOTE:
            await deleteFinancialNote(action.data.id);
            responses.push(action.message || "Financial note deleted successfully.");
            break;
            
          case ActionType.RESPOND:
            responses.push(action.message || "Operation completed successfully.");
            break;
            
          default:
            console.warn(`Unknown action type: ${action.type}`);
            break;
        }
      } catch (error) {
        console.error(`Error executing action ${action.type}:`, error);
        responses.push(`Failed to execute ${action.type}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    return responses.join("\n");
  }

  /**
   * Build system prompt for CRUD operations
   * @param categories - Existing transaction categories
   * @returns System prompt string
   */
  private buildCrudSystemPrompt(
    categories: Array<Database["public"]["Tables"]["transaction_categories"]["Row"]>
  ): string {
    return `
You are an AI financial assistant tasked with interpreting user requests for financial transaction operations.
Your job is to determine if the user's request can be handled with simple CRUD operations on transactions
and transaction categories.

TODAY'S DATE: ${new Date().toLocaleDateString()}

EXISTING TRANSACTION CATEGORIES:
${categories.map(category => `- ${category.name} (${category.type}): ${category.description || "No description"}`).join("\n")}

INSTRUCTIONS:
1. Analyze the user's request to determine if it involves creating, reading, updating, or deleting transactions.
2. If a category is mentioned, check if it matches an existing category before suggesting to create a new one.
3. Only create a new category if none of the existing categories are a suitable match.
4. IMPORTANT: You CANNOT create new wallets. You must use existing wallets only. If the user requests a transaction with a wallet that doesn't exist, ask them to use an existing wallet instead.
5. Return your response as a JSON object with an "actions" array.
6. IMPORTANT: If the request is asking for financial advice, budgeting guidance, spending analysis, or questions like "do I have money for X" or "should I buy X", respond with a single action of type "respond" with a message that includes the phrase "requires financial analysis".
7. IMPORTANT: Consider the conversation history when provided. If previous messages contain relevant information, use it to inform your response.

Each action in the array should have:
- "type": The type of action to perform (create_transaction, update_transaction, delete_transaction, create_category, respond)
- "data": The data needed for the action
- "message": A human-readable message explaining the action

For transactions, include:
- amount: number (positive for income, expense should use negative values)
- type: string ("in" for income, "out" for expense)
- description: string
- category_name: string (name of the category - the system will find or create it automatically)
- wallet_name: string (name of the wallet - the wallet must already exist in the system)

For categories, include:
- name: string
- type: string ("in" for income, "out" for expense)
- description: string

EXAMPLE RESPONSE FOR TRANSACTION:
{
  "actions": [
    {
      "type": "create_transaction",
      "data": {
        "amount": -25.99,
        "type": "out",
        "description": "Dinner at Italian restaurant",
        "category_name": "Restaurant",
        "wallet_name": "Cash Wallet"
      },
      "message": "I've recorded your dinner expense of $25.99."
    }
  ]
}

EXAMPLE RESPONSE FOR WALLET THAT DOESN'T EXIST:
{
  "actions": [
    {
      "type": "respond",
      "data": null,
      "message": "I cannot create transactions for 'Travel Wallet' as this wallet doesn't exist. Please use one of your existing wallets instead."
    }
  ]
}

EXAMPLE RESPONSE FOR FINANCIAL ADVICE REQUEST:
{
  "actions": [
    {
      "type": "respond",
      "data": null,
      "message": "This request requires financial analysis to provide proper advice."
    }
  ]
}

If you can't determine a CRUD operation from the request, or if the request requires financial analysis, 
include a single action with type "respond" and a message indicating you need more information.
`;
  }

  /**
   * Build system prompt for financial analysis
   * @param dbData - Database data to include in the prompt
   * @returns System prompt string
   */
  private buildAnalysisSystemPrompt(
    dbData: {
      wallets?: Array<Database["public"]["Tables"]["wallets"]["Row"]>;
      walletBalances?: Array<Database["public"]["Tables"]["wallet_balances"]["Row"]>;
      categories?: Array<Database["public"]["Tables"]["transaction_categories"]["Row"]>;
      transactions?: Array<Database["public"]["Tables"]["transactions"]["Row"]>;
      financialNotes?: Array<Database["public"]["Tables"]["financial_notes"]["Row"]>;
      extractedDetails?: string;
    }
  ): string {
    let dataContext = "";
    
    if (dbData.wallets && dbData.wallets.length > 0) {
      dataContext += "WALLETS:\n";
      dataContext += dbData.wallets.map(wallet => 
        `- ${wallet.name} (${wallet.type}): ID=${wallet.id}`
      ).join("\n");
      dataContext += "\n\n";
    }
    
    if (dbData.walletBalances && dbData.walletBalances.length > 0) {
      dataContext += "WALLET BALANCES:\n";
      dataContext += dbData.walletBalances.map(balance => 
        `- Wallet ID=${balance.wallet_id}, Balance=${balance.balance}, Updated=${balance.updated_at}`
      ).join("\n");
      dataContext += "\n\n";
    }
    
    if (dbData.categories && dbData.categories.length > 0) {
      dataContext += "TRANSACTION CATEGORIES:\n";
      dataContext += dbData.categories.map(category => 
        `- ${category.name} (${category.type}): ${category.description || "No description"} (ID=${category.id})`
      ).join("\n");
      dataContext += "\n\n";
    }
    
    if (dbData.transactions && dbData.transactions.length > 0) {
      dataContext += "TRANSACTIONS:\n";
      dataContext += dbData.transactions.map(tx => 
        `- ${tx.created_at}: ${tx.type} $${tx.amount} (${tx.description || "No description"}) [Category ID=${tx.category_id || "None"}, Wallet ID=${tx.wallet_id}, ID=${tx.id}]`
      ).join("\n");
      dataContext += "\n\n";
    }
    
    if (dbData.financialNotes && dbData.financialNotes.length > 0) {
      dataContext += "FINANCIAL NOTES:\n";
      dataContext += dbData.financialNotes.map(note => 
        `- ${note.created_at}: "${note.note}" [Category ID=${note.related_category_id || "None"}, Wallet ID=${note.related_wallet_id || "None"}, ID=${note.id}]`
      ).join("\n");
      dataContext += "\n\n";
    }

    return `
You are an AI financial advisor tasked with analyzing financial data and providing personalized insights and recommendations.
You act as the user's personal financial advisor, helping them make informed decisions about spending, saving, and managing their finances.
Your goal is to help the user to steadily improve their financial situation.
Your job is to analyze the user's request in relation to their financial data and provide helpful, actionable advice that considers their complete financial picture.

TODAY'S DATE: ${new Date().toLocaleDateString()}

DATABASE CONTEXT:
${dataContext}

${dbData.extractedDetails ? dbData.extractedDetails : ""}

INSTRUCTIONS:
1. Analyze the user's request in relation to the provided financial data.
2. Provide clear, specific advice based on their current financial situation.
3. IMPORTANT: Create a financial note when the user shares NEW important financial information such as:
   - Income sources and payment schedules (salary dates, recurring income)
   - Financial goals (saving targets, major purchases)
   - Regular expense patterns (rent/mortgage dates, bill due dates)
   - Financial constraints or concerns
4. Respond directly to questions about affordability, budgeting, and financial decisions.
5. Return your response as a JSON object with an "actions" array.
6. IMPORTANT: Pay close attention to the conversation history to identify important financial details the user has shared previously. Reference and incorporate this information in your analysis.

Each action in the array should have:
- "type": The type of action to perform (create_note, update_note, delete_note, respond)
- "data": The data needed for the action
- "message": A human-readable message explaining the action or providing the analysis

For financial notes, include:
- note: string (the content of the note) - REQUIRED
- related_category_id: string (if applicable, can be omitted if not relevant)
- related_wallet_id: string (if applicable, can be omitted if not relevant)
- context: object (any additional context as a JSON object, always include at least some basic context)

IMPORTANT: Focus on creating notes that capture CRITICAL financial details rather than creating a note for every interaction.
IMPORTANT: Note creation does NOT require UUIDs. The system will handle creating the IDs automatically. Just provide the note text and optional related information.

For example, if the user mentions "my salary comes in on the 7th of every month" or "I pay rent on the 1st", 
ALWAYS create a note to record this important financial schedule. This information should be referenced in future analyses.

When responding to questions like "Do I have money for X?" or "Should I buy X?":
1. Check their wallet balances to determine if they have sufficient funds
2. Analyze their spending patterns in related categories
3. Reference important dates like their salary schedule, rent dates, or bill payments
4. Provide specific advice about the purchase based on their financial situation
5. Include relevant context about their overall financial health
6. Reference previous advice or discussions from the conversation history when applicable

EXAMPLE FINANCIAL DETAIL NOTE:
{
  "actions": [
    {
      "type": "create_note",
      "data": {
        "note": "User receives salary on the 7th of each month. Important for cash flow planning.",
        "context": { "detail_type": "income_schedule", "income_type": "salary", "day_of_month": 7 }
      },
      "message": "I've recorded your salary schedule."
    },
    {
      "type": "respond",
      "data": null,
      "message": "I'll keep in mind that your salary arrives on the 7th of each month when providing financial advice."
    }
  ]
}

EXAMPLE ADVICE RESPONSE:
{
  "actions": [
    {
      "type": "respond",
      "data": null,
      "message": "Looking at your current wallet balance of $320 and noting that your salary won't arrive for another 16 days (on the 7th), spending $20 daily on food would deplete your funds before your next paycheck. I recommend limiting your food spending to $10-15 per day for the next 16 days, which would leave you with some emergency funds while still allowing for adequate meals."
    }
  ]
}
`;
  }
} 