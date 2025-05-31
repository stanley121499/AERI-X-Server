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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = exports.ActionType = void 0;
const wallets_1 = require("../db/wallets");
const wallet_balances_1 = require("../db/wallet_balances");
const transaction_categories_1 = require("../db/transaction_categories");
const transactions_1 = require("../db/transactions");
const financial_notes_1 = require("../db/financial_notes");
/**
 * Action types for CRUD operations
 */
var ActionType;
(function (ActionType) {
    ActionType["CREATE_TRANSACTION"] = "create_transaction";
    ActionType["UPDATE_TRANSACTION"] = "update_transaction";
    ActionType["DELETE_TRANSACTION"] = "delete_transaction";
    ActionType["CREATE_CATEGORY"] = "create_category";
    ActionType["CREATE_NOTE"] = "create_note";
    ActionType["UPDATE_NOTE"] = "update_note";
    ActionType["DELETE_NOTE"] = "delete_note";
    ActionType["RESPOND"] = "respond";
})(ActionType || (exports.ActionType = ActionType = {}));
/**
 * AI Service class for handling AI model interactions
 */
class AIService {
    /**
     * Initializes the AI Service
     * @param openaiClient - OpenAI client instance
     */
    constructor(openaiClient) {
        this.openaiClient = openaiClient;
    }
    /**
     * Process CRUD operations based on user prompt
     * @param prompt - User input prompt
     * @param conversationHistory - Previous conversation messages (optional)
     * @returns AI model response with actions
     */
    processCrudOperations(prompt_1) {
        return __awaiter(this, arguments, void 0, function* (prompt, conversationHistory = []) {
            // Get all transaction categories for context
            const categories = yield (0, transaction_categories_1.fetchAllTransactionCategories)();
            // Build a prompt for the AI model
            const systemPrompt = this.buildCrudSystemPrompt(categories);
            // Prepare messages for the API call, including conversation history
            const messages = [
                {
                    role: "system",
                    content: systemPrompt,
                },
                ...conversationHistory,
                {
                    role: "user",
                    content: prompt,
                },
            ];
            // Call OpenAI API
            const completion = yield this.openaiClient.chat.completions.create({
                model: "gpt-4o-mini-2024-07-18",
                messages,
                response_format: { type: "json_object" }
            });
            // Parse the response as JSON
            const responseContent = completion.choices[0].message.content || "{}";
            try {
                const parsedResponse = JSON.parse(responseContent);
                return parsedResponse;
            }
            catch (error) {
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
        });
    }
    /**
     * Process financial analysis based on user prompt and database data
     * @param prompt - User input prompt
     * @param conversationHistory - Previous conversation messages (optional)
     * @returns AI model response with actions
     */
    processFinancialAnalysis(prompt_1) {
        return __awaiter(this, arguments, void 0, function* (prompt, conversationHistory = []) {
            // Fetch all necessary data for comprehensive analysis
            const wallets = yield (0, wallets_1.fetchAllWallets)();
            const balances = yield (0, wallet_balances_1.fetchAllWalletBalances)();
            const categories = yield (0, transaction_categories_1.fetchAllTransactionCategories)();
            const transactions = yield (0, transactions_1.fetchAllTransactions)();
            const notes = yield (0, financial_notes_1.fetchAllFinancialNotes)();
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
                    role: "system",
                    content: systemPrompt,
                },
                ...conversationHistory,
                {
                    role: "user",
                    content: prompt,
                },
            ];
            // Call OpenAI API
            const completion = yield this.openaiClient.chat.completions.create({
                model: "gpt-4o-mini-2024-07-18",
                messages,
                response_format: { type: "json_object" }
            });
            // Parse the response as JSON
            const responseContent = completion.choices[0].message.content || "{}";
            try {
                const parsedResponse = JSON.parse(responseContent);
                return parsedResponse;
            }
            catch (error) {
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
        });
    }
    /**
     * Calculate string similarity using Levenshtein distance
     * @param str1 - First string
     * @param str2 - Second string
     * @returns Similarity ratio between 0 and 1
     */
    calculateStringSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        if (longer.length === 0) {
            return 1.0;
        }
        const editDistance = this.levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }
    /**
     * Calculate Levenshtein distance between two strings
     * @param str1 - First string
     * @param str2 - Second string
     * @returns Edit distance
     */
    levenshteinDistance(str1, str2) {
        const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
        for (let i = 0; i <= str1.length; i++) {
            matrix[0][i] = i;
        }
        for (let j = 0; j <= str2.length; j++) {
            matrix[j][0] = j;
        }
        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                if (str1[i - 1] === str2[j - 1]) {
                    matrix[j][i] = matrix[j - 1][i - 1];
                }
                else {
                    matrix[j][i] = Math.min(matrix[j - 1][i - 1] + 1, // substitution
                    matrix[j][i - 1] + 1, // insertion
                    matrix[j - 1][i] + 1 // deletion
                    );
                }
            }
        }
        return matrix[str2.length][str1.length];
    }
    /**
     * Extract important financial details from conversation history
     * @param conversationHistory - Previous conversation messages
     * @returns String of extracted financial details
     */
    extractFinancialDetailsFromHistory(conversationHistory) {
        if (!conversationHistory || conversationHistory.length === 0) {
            return "";
        }
        // Keywords and patterns to look for
        const financialPatterns = [
            // Income patterns
            { pattern: /salary|income|earn|pay(check|day)|get paid/i, category: "Income", weight: 3 },
            { pattern: /(day|date|every|each|[0-9]+)(st|nd|rd|th)? (of )?(\w+ )?(month|week|fortnight|bi-weekly)/i, category: "Payment Schedule", weight: 3 },
            { pattern: /[0-9]+(?:st|nd|rd|th)?(?=\s+(?:of\s+)?(?:january|february|march|april|may|june|july|august|september|october|november|december))/i, category: "Payment Date", weight: 3 },
            { pattern: /(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+[0-9]+(?:st|nd|rd|th)?/i, category: "Payment Date", weight: 3 },
            // Expense patterns
            { pattern: /rent|mortgage|bill|subscription|payment/i, category: "Recurring Expense", weight: 3 },
            { pattern: /due (date|on)|deadline|by the/i, category: "Payment Deadline", weight: 2 },
            // Financial goals and planning
            { pattern: /save|saving|budget|goal|target|plan/i, category: "Financial Goal", weight: 2 },
            { pattern: /emergency fund|rainy day|backup/i, category: "Emergency Planning", weight: 3 },
            // Financial constraints and debt
            { pattern: /debt|loan|credit|owe|borrow/i, category: "Debt", weight: 3 },
            { pattern: /limit|restrict|cut( down)?|reduce/i, category: "Spending Constraint", weight: 2 },
            // Currency and amounts
            { pattern: /(\$|USD|MYR|RM|€|£)[0-9,]+(\.[0-9]{2})?/i, category: "Amount Mentioned", weight: 2 },
            { pattern: /[0-9,]+(\.[0-9]{2})?\s*(dollars?|ringgit|MYR|USD)/i, category: "Amount Mentioned", weight: 2 },
            // Financial advice requests
            { pattern: /(do i have|can i afford|should i buy|worth buying)/i, category: "Financial Decision", weight: 2 },
            { pattern: /(help me|advice|recommend|suggest).*?(financial|money|budget)/i, category: "Advice Request", weight: 2 }
        ];
        // Extract relevant financial information from conversation with context
        let extractedDetails = "CONVERSATION CONTEXT AND FINANCIAL DETAILS:\n";
        let detailsFound = false;
        let previousTopics = new Set();
        // Analyze the full conversation flow
        const conversationSummary = this.summarizeConversationFlow(conversationHistory);
        if (conversationSummary) {
            extractedDetails += `\nCONVERSATION FLOW SUMMARY:\n${conversationSummary}\n`;
            detailsFound = true;
        }
        conversationHistory.forEach((message, index) => {
            if (message.role === "user") {
                // Check for financial patterns in user messages
                const matches = financialPatterns.filter(pattern => pattern.pattern.test(message.content));
                if (matches.length > 0) {
                    detailsFound = true;
                    // Calculate importance score
                    const importanceScore = matches.reduce((sum, match) => sum + match.weight, 0);
                    const isHighImportance = importanceScore >= 5;
                    extractedDetails += `${isHighImportance ? "⭐ HIGH PRIORITY" : "📝"} User Message #${index + 1}: "${message.content}"\n`;
                    extractedDetails += `   Detected Categories: ${matches.map(m => m.category).join(", ")}\n`;
                    extractedDetails += `   Importance Score: ${importanceScore}\n`;
                    // Track topics mentioned
                    matches.forEach(match => previousTopics.add(match.category));
                    // If we have an assistant response following this, include it for context
                    if (index + 1 < conversationHistory.length && conversationHistory[index + 1].role === "assistant") {
                        const assistantResponse = conversationHistory[index + 1].content;
                        extractedDetails += `   My Previous Response: "${assistantResponse.substring(0, 150)}${assistantResponse.length > 150 ? "..." : ""}"\n`;
                    }
                    extractedDetails += "\n";
                }
            }
        });
        // Add summary of recurring topics
        if (previousTopics.size > 0) {
            extractedDetails += `RECURRING TOPICS IN CONVERSATION: ${Array.from(previousTopics).join(", ")}\n\n`;
        }
        // Add guidance for conversation continuity
        if (detailsFound) {
            extractedDetails += "IMPORTANT: Use this conversation context to:\n";
            extractedDetails += "- Reference previous information instead of asking again\n";
            extractedDetails += "- Build upon previously discussed topics\n";
            extractedDetails += "- Maintain conversation continuity\n";
            extractedDetails += "- Avoid repeating advice or creating duplicate notes\n\n";
        }
        return detailsFound ? extractedDetails : "";
    }
    /**
     * Summarize the conversation flow to understand the user's journey
     * @param conversationHistory - Previous conversation messages
     * @returns Summary of conversation flow
     */
    summarizeConversationFlow(conversationHistory) {
        if (!conversationHistory || conversationHistory.length === 0) {
            return "";
        }
        const userMessages = conversationHistory
            .filter(msg => msg.role === "user")
            .map((msg, index) => ({ index: index + 1, content: msg.content }));
        if (userMessages.length === 0) {
            return "";
        }
        let summary = `User has made ${userMessages.length} request(s) in this conversation:\n`;
        userMessages.forEach((msg, index) => {
            const preview = msg.content.length > 80 ?
                msg.content.substring(0, 80) + "..." :
                msg.content;
            summary += `${index + 1}. "${preview}"\n`;
        });
        // Identify conversation patterns
        const topics = new Set();
        const keywords = ["debt", "salary", "rent", "budget", "money", "afford", "buy", "save", "plan"];
        userMessages.forEach(msg => {
            keywords.forEach(keyword => {
                if (msg.content.toLowerCase().includes(keyword)) {
                    topics.add(keyword);
                }
            });
        });
        if (topics.size > 0) {
            summary += `Main topics discussed: ${Array.from(topics).join(", ")}\n`;
        }
        return summary;
    }
    /**
     * Execute actions returned by the AI model
     * @param actions - List of actions to execute
     * @returns Response message to send back to the user
     */
    executeActions(actions) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const responses = [];
            // Process all actions
            for (const action of actions) {
                try {
                    switch (action.type) {
                        case ActionType.CREATE_TRANSACTION:
                            // Handle category_name field by finding or creating the category
                            if (action.data.category_name && typeof action.data.category_name === "string") {
                                // Get all categories to check for a match
                                const categories = yield (0, transaction_categories_1.fetchAllTransactionCategories)();
                                // Check if we already have a category with this name
                                const matchingCategory = categories.find(cat => cat.name.toLowerCase() === action.data.category_name.toLowerCase());
                                if (matchingCategory) {
                                    // Use the existing category's ID
                                    action.data.category_id = matchingCategory.id;
                                    console.log(`Using existing category "${matchingCategory.name}" with ID: ${matchingCategory.id}`);
                                }
                                else {
                                    // Create a new category with this name
                                    const newCategory = yield (0, transaction_categories_1.createTransactionCategory)({
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
                                const existingWallet = yield (0, wallets_1.fetchWalletByName)(action.data.wallet_name);
                                if (existingWallet) {
                                    // Use the existing wallet's ID
                                    action.data.wallet_id = existingWallet.id;
                                    console.log(`Using existing wallet "${existingWallet.name}" with ID: ${existingWallet.id}`);
                                }
                                else {
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
                            }
                            else if (typeof action.data.wallet_id === "string") {
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
                                        .replace(/^\w/, (c) => c.toUpperCase());
                                    const newCategory = yield (0, transaction_categories_1.createTransactionCategory)({
                                        name: categoryName || "Miscellaneous",
                                        type: action.data.type,
                                        description: "Automatically created from ID placeholder"
                                    });
                                    action.data.category_id = newCategory.id;
                                    responses.push(`Created a new category: ${newCategory.name}`);
                                }
                            }
                            yield (0, transactions_1.createTransaction)(action.data);
                            responses.push(action.message || "Transaction created successfully.");
                            break;
                        case ActionType.UPDATE_TRANSACTION:
                            yield (0, transactions_1.updateTransaction)(action.data.id, action.data);
                            responses.push(action.message || "Transaction updated successfully.");
                            break;
                        case ActionType.DELETE_TRANSACTION:
                            yield (0, transactions_1.deleteTransaction)(action.data.id);
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
                            const newCategory = yield (0, transaction_categories_1.createTransactionCategory)(action.data);
                            responses.push(action.message || "Category created successfully.");
                            break;
                        case ActionType.CREATE_NOTE:
                            // Validate the note field is present
                            if (!action.data.note || typeof action.data.note !== "string" || action.data.note.trim() === "") {
                                throw new Error("Note content is required and must be a non-empty string");
                            }
                            // Handle related_category_id by name if provided as a string that isn't a UUID
                            if (action.data.related_category_name && typeof action.data.related_category_name === "string") {
                                const categories = yield (0, transaction_categories_1.fetchAllTransactionCategories)();
                                const matchingCategory = categories.find(cat => cat.name.toLowerCase() === action.data.related_category_name.toLowerCase());
                                if (matchingCategory) {
                                    action.data.related_category_id = matchingCategory.id;
                                    console.log(`Using existing category "${matchingCategory.name}" for note relation`);
                                }
                                // Remove the field as it's not part of the DB schema
                                delete action.data.related_category_name;
                            }
                            // Handle related_wallet_id by name if provided
                            if (action.data.related_wallet_name && typeof action.data.related_wallet_name === "string") {
                                const existingWallet = yield (0, wallets_1.fetchWalletByName)(action.data.related_wallet_name);
                                if (existingWallet) {
                                    action.data.related_wallet_id = existingWallet.id;
                                    console.log(`Using existing wallet "${existingWallet.name}" for note relation`);
                                }
                                // Remove the field as it's not part of the DB schema
                                delete action.data.related_wallet_name;
                            }
                            // Create the note with the data
                            yield (0, financial_notes_1.createFinancialNote)(action.data);
                            console.log("Financial note created:", action.data.note);
                            responses.push((_a = action.message) !== null && _a !== void 0 ? _a : "Financial note created successfully.");
                            break;
                        case ActionType.UPDATE_NOTE:
                            yield (0, financial_notes_1.updateFinancialNote)(action.data.id, action.data);
                            responses.push(action.message || "Financial note updated successfully.");
                            break;
                        case ActionType.DELETE_NOTE:
                            yield (0, financial_notes_1.deleteFinancialNote)(action.data.id);
                            responses.push(action.message || "Financial note deleted successfully.");
                            break;
                        case ActionType.RESPOND:
                            responses.push(action.message || "Operation completed successfully.");
                            break;
                        default:
                            console.warn(`Unknown action type: ${action.type}`);
                            break;
                    }
                }
                catch (error) {
                    console.error(`Error executing action ${action.type}:`, error);
                    responses.push(`Failed to execute ${action.type}: ${error instanceof Error ? error.message : String(error)}`);
                }
            }
            return responses.join("\n");
        });
    }
    /**
     * Build system prompt for CRUD operations
     * @param categories - Existing transaction categories
     * @returns System prompt string
     */
    buildCrudSystemPrompt(categories) {
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
    buildAnalysisSystemPrompt(dbData) {
        let dataContext = "";
        if (dbData.wallets && dbData.wallets.length > 0) {
            dataContext += "WALLETS:\n";
            dataContext += dbData.wallets.map(wallet => `- ${wallet.name} (${wallet.type}): ID=${wallet.id}`).join("\n");
            dataContext += "\n\n";
        }
        if (dbData.walletBalances && dbData.walletBalances.length > 0) {
            dataContext += "WALLET BALANCES:\n";
            dataContext += dbData.walletBalances.map(balance => `- Wallet ID=${balance.wallet_id}, Balance=${balance.balance}, Updated=${balance.updated_at}`).join("\n");
            dataContext += "\n\n";
        }
        if (dbData.categories && dbData.categories.length > 0) {
            dataContext += "TRANSACTION CATEGORIES:\n";
            dataContext += dbData.categories.map(category => `- ${category.name} (${category.type}): ${category.description || "No description"} (ID=${category.id})`).join("\n");
            dataContext += "\n\n";
        }
        if (dbData.transactions && dbData.transactions.length > 0) {
            dataContext += "TRANSACTIONS:\n";
            dataContext += dbData.transactions.map(tx => `- ${tx.created_at}: ${tx.type} $${tx.amount} (${tx.description || "No description"}) [Category ID=${tx.category_id || "None"}, Wallet ID=${tx.wallet_id}, ID=${tx.id}]`).join("\n");
            dataContext += "\n\n";
        }
        if (dbData.financialNotes && dbData.financialNotes.length > 0) {
            dataContext += "FINANCIAL NOTES:\n";
            dataContext += dbData.financialNotes.map(note => `- ${note.created_at}: "${note.note}" [Category ID=${note.related_category_id || "None"}, Wallet ID=${note.related_wallet_id || "None"}, ID=${note.id}]`).join("\n");
            dataContext += "\n\n";
        }
        return `
You are an AI financial advisor tasked with analyzing financial data and providing personalized insights and recommendations.
You act as the user's personal financial advisor, helping them make informed decisions about spending, saving, and managing their finances.
Your goal is to help the user to steadily improve their financial situation.
Your job is to analyze the user's request in relation to their financial data and provide helpful, actionable advice that considers their complete financial picture.

CRITICAL: This is a CONTINUING CONVERSATION. You must maintain context and build upon previous discussions. DO NOT treat each message as an isolated interaction.

TODAY'S DATE: ${new Date().toLocaleDateString()}

DATABASE CONTEXT:
${dataContext}

${dbData.extractedDetails ? dbData.extractedDetails : ""}

CONVERSATION CONTINUITY RULES:
1. Always reference relevant information from the conversation history when applicable
2. Build upon previous advice instead of repeating it
3. Use phrases like "As we discussed earlier..." or "Building on our previous conversation..." when relevant
4. If the user asks about something already covered, acknowledge the previous discussion

NOTE MANAGEMENT DECISION FRAMEWORK:
5. CAREFULLY REVIEW ALL EXISTING FINANCIAL NOTES listed above before taking any note action
6. Use this decision tree for note actions:
   
   CREATE_NOTE when:
   - User shares completely NEW financial information not covered in existing notes
   - User mentions a NEW income source, payment date, or financial schedule
   - User reveals NEW financial goals, constraints, or major life changes
   - User provides NEW specific amounts, dates, or financial details
   
   UPDATE_NOTE when:
   - User provides updated information that changes existing note content
   - Previous information becomes outdated or incorrect
   - User adds important details to previously discussed topics
   - You need to modify an existing note with new context
   
   DELETE_NOTE when:
   - User explicitly says previous information is no longer relevant
   - Financial circumstances have changed making old notes obsolete
   - User corrects misinformation that was previously recorded
   
   NO NOTE ACTION (just respond) when:
   - Information is already well-documented in existing notes
   - User is asking questions about previously discussed topics
   - You're providing analysis based on existing data
   - User is repeating information already captured

7. If you reference existing notes in your response, be specific about which note you're referencing
8. When creating notes, be specific and actionable - include relevant context that will help in future conversations

ANALYSIS INSTRUCTIONS:
1. Analyze the user's request in relation to the provided financial data AND conversation history
2. Provide clear, specific advice based on their current financial situation AND previous discussions
3. Reference specific numbers from their wallet balances, transactions, and notes
4. Consider their previously mentioned financial constraints, goals, and schedules
5. Return your response as a JSON object with an "actions" array

Each action in the array should have:
- "type": The type of action to perform (create_note, update_note, delete_note, respond)
- "data": The data needed for the action
- "message": A human-readable message explaining the action or providing the analysis

For financial notes, include:
- note: string (the content of the note) - REQUIRED
- related_category_id: string (if applicable, can be omitted if not relevant)
- related_wallet_id: string (if applicable, can be omitted if not relevant)
- context: object (any additional context as a JSON object, always include at least some basic context)

RESPONSE STYLE GUIDELINES:
- Be conversational and refer to previous discussions
- Use specific data from their financial situation
- Provide actionable, personalized advice
- Show continuity in your financial guidance
- Acknowledge progress or changes since previous conversations

EXAMPLE CONVERSATION-AWARE RESPONSE:
{
  "actions": [
    {
      "type": "respond",
      "data": null,
      "message": "Based on our previous discussion about your 100k MYR debt and the 1,600 MYR monthly rent and utilities we calculated, I can see you're still working on the budgeting plan we outlined. With your current total balance of 570 MYR across both wallets, and knowing your salary schedule, you'll need to be very strategic about this purchase. As I mentioned before, prioritizing debt payments while covering essential expenses is crucial right now."
    }
  ]
}

EXAMPLE WHEN EXISTING NOTE COVERS THE TOPIC:
{
  "actions": [
    {
      "type": "respond",
      "data": null,
      "message": "I see you're asking about your debt situation again. As noted in my records: 'User has significant debt (100k MYR) with monthly rent and utilities of 1.6k MYR. Monthly income is 4k MYR.' The budgeting strategy we discussed previously still applies - would you like me to help you implement specific aspects of that plan or address any new concerns?"
    }
  ]
}

EXAMPLE FOR GENUINELY NEW INFORMATION:
{
  "actions": [
    {
      "type": "create_note",
      "data": {
        "note": "User's employer has changed salary payment date from 7th to 15th of each month. This affects cash flow planning significantly.",
        "context": { "detail_type": "schedule_change", "previous_date": 7, "new_date": 15, "change_type": "salary_schedule" }
      },
      "message": "I've updated my records with your new salary schedule."
    },
    {
      "type": "respond",
      "data": null,
      "message": "This salary date change from the 7th to the 15th will significantly impact your cash flow planning. Let me help you adjust your budget timeline accordingly..."
    }
  ]
}

EXAMPLE FOR UPDATING EXISTING INFORMATION:
{
  "actions": [
    {
      "type": "update_note",
      "data": {
        "id": "existing-note-uuid-here",
        "note": "User has 100k MYR debt (updated from previous estimate). Monthly expenses: rent and utilities 1.6k MYR. Salary: 4k MYR monthly, paid on 7th. Urgent need for debt management plan.",
        "context": { "detail_type": "debt_update", "previous_amount": "estimated", "confirmed_amount": "100k MYR" }
      },
      "message": "I've updated your financial profile with the confirmed debt amount."
    },
    {
      "type": "respond", 
      "data": null,
      "message": "Now that I have the confirmed debt amount of 100k MYR, let me revise the debt management strategy we discussed..."
    }
  ]
}

EXAMPLE FOR REFERENCING EXISTING NOTES (NO NOTE ACTION):
{
  "actions": [
    {
      "type": "respond",
      "data": null,
      "message": "Based on the financial profile I have on record - your 100k MYR debt, 4k MYR monthly salary (paid on the 7th), and 1.6k MYR monthly expenses for rent and utilities - you have about 2.4k MYR available monthly for debt payments and other expenses. As we discussed in our previous conversation, the priority should be..."
    }
  ]
}
`;
    }
}
exports.AIService = AIService;
