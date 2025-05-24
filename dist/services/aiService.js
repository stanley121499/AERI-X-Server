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
     * @returns AI model response with actions
     */
    processCrudOperations(prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get all transaction categories for context
            const categories = yield (0, transaction_categories_1.fetchAllTransactionCategories)();
            // Build a prompt for the AI model
            const systemPrompt = this.buildCrudSystemPrompt(categories);
            // Call OpenAI API
            const completion = yield this.openaiClient.chat.completions.create({
                model: "gpt-4o-mini-2024-07-18",
                messages: [
                    {
                        role: "system",
                        content: systemPrompt,
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
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
     * @returns AI model response with actions
     */
    processFinancialAnalysis(prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            // Fetch all necessary data for comprehensive analysis
            const wallets = yield (0, wallets_1.fetchAllWallets)();
            const balances = yield (0, wallet_balances_1.fetchAllWalletBalances)();
            const categories = yield (0, transaction_categories_1.fetchAllTransactionCategories)();
            const transactions = yield (0, transactions_1.fetchAllTransactions)();
            const notes = yield (0, financial_notes_1.fetchAllFinancialNotes)();
            // Build a prompt for the AI model
            const systemPrompt = this.buildAnalysisSystemPrompt({
                wallets,
                walletBalances: balances,
                categories,
                transactions,
                financialNotes: notes
            });
            // Call OpenAI API
            const completion = yield this.openaiClient.chat.completions.create({
                model: "gpt-4o-mini-2024-07-18",
                messages: [
                    {
                        role: "system",
                        content: systemPrompt,
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
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
     * Execute actions returned by the AI model
     * @param actions - List of actions to execute
     * @returns Response message to send back to the user
     */
    executeActions(actions) {
        return __awaiter(this, void 0, void 0, function* () {
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
                            // Handle wallet_name field by finding or creating the wallet
                            if (action.data.wallet_name && typeof action.data.wallet_name === "string") {
                                // Try to find an existing wallet with this name
                                const existingWallet = yield (0, wallets_1.fetchWalletByName)(action.data.wallet_name);
                                if (existingWallet) {
                                    // Use the existing wallet's ID
                                    action.data.wallet_id = existingWallet.id;
                                    console.log(`Using existing wallet "${existingWallet.name}" with ID: ${existingWallet.id}`);
                                }
                                else {
                                    // Create a new wallet with this name
                                    const newWallet = yield (0, wallets_1.createWallet)({
                                        name: action.data.wallet_name,
                                        type: "cash", // Default type, can be updated later
                                        metadata: {}
                                    });
                                    // Use the new wallet's ID
                                    action.data.wallet_id = newWallet.id;
                                    console.log(`Created new wallet "${newWallet.name}" with ID: ${newWallet.id}`);
                                    responses.push(`Created a new wallet: ${newWallet.name}`);
                                }
                                // Remove the wallet_name field as it's not needed anymore
                                delete action.data.wallet_name;
                            }
                            // Validate wallet_id is present and a valid UUID
                            if (!action.data.wallet_id) {
                                // If no wallet_id or wallet_name was provided, use a default wallet
                                const defaultWalletName = "Default Wallet";
                                // Try to find or create the default wallet
                                let defaultWallet = yield (0, wallets_1.fetchWalletByName)(defaultWalletName);
                                if (!defaultWallet) {
                                    defaultWallet = yield (0, wallets_1.createWallet)({
                                        name: defaultWalletName,
                                        type: "cash",
                                        metadata: { isDefault: true }
                                    });
                                    console.log(`Created default wallet with ID: ${defaultWallet.id}`);
                                    responses.push(`Created a default wallet for this transaction.`);
                                }
                                action.data.wallet_id = defaultWallet.id;
                            }
                            else if (typeof action.data.wallet_id === "string") {
                                const walletUuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
                                if (!walletUuidRegex.test(action.data.wallet_id)) {
                                    // Try to treat non-UUID wallet_id as a name
                                    const walletName = action.data.wallet_id
                                        .replace(/_/g, ' ')
                                        .replace(/wallet/i, '')
                                        .replace(/id/i, '')
                                        .trim()
                                        .replace(/^\w/, (c) => c.toUpperCase());
                                    if (walletName) {
                                        // Try to find or create a wallet with this name
                                        let wallet = yield (0, wallets_1.fetchWalletByName)(walletName);
                                        if (!wallet) {
                                            wallet = yield (0, wallets_1.createWallet)({
                                                name: walletName,
                                                type: "cash",
                                                metadata: {}
                                            });
                                            responses.push(`Created a new wallet: ${wallet.name}`);
                                        }
                                        action.data.wallet_id = wallet.id;
                                    }
                                    else {
                                        throw new Error(`Invalid UUID format for wallet_id: ${action.data.wallet_id}`);
                                    }
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
                            yield (0, financial_notes_1.createFinancialNote)(action.data);
                            responses.push(action.message || "Financial note created successfully.");
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

EXISTING TRANSACTION CATEGORIES:
${categories.map(category => `- ${category.name} (${category.type}): ${category.description || "No description"}`).join("\n")}

INSTRUCTIONS:
1. Analyze the user's request to determine if it involves creating, reading, updating, or deleting transactions.
2. If a category is mentioned, check if it matches an existing category before suggesting to create a new one.
3. Only create a new category if none of the existing categories are a suitable match.
4. Return your response as a JSON object with an "actions" array.
5. IMPORTANT: If the request is asking for financial advice, budgeting guidance, spending analysis, or questions like "do I have money for X" or "should I buy X", respond with a single action of type "respond" with a message that includes the phrase "requires financial analysis".

Each action in the array should have:
- "type": The type of action to perform (create_transaction, update_transaction, delete_transaction, create_category, respond)
- "data": The data needed for the action
- "message": A human-readable message explaining the action

For transactions, include:
- amount: number (positive for income, expense should use negative values)
- type: string ("in" for income, "out" for expense)
- description: string
- category_name: string (name of the category - the system will find or create it automatically)
- wallet_name: string (name of the wallet - the system will find or create it automatically)

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
Your job is to analyze the user's request in relation to their financial data and provide helpful, actionable advice that considers their complete financial picture.

DATABASE CONTEXT:
${dataContext}

INSTRUCTIONS:
1. Analyze the user's request in relation to the provided financial data.
2. Provide clear, specific advice based on their current financial situation.
3. If you identify important insights or patterns, create a financial note to record this information.
4. Respond directly to questions about affordability, budgeting, and financial decisions.
5. Return your response as a JSON object with an "actions" array.

Each action in the array should have:
- "type": The type of action to perform (create_note, update_note, delete_note, respond)
- "data": The data needed for the action
- "message": A human-readable message explaining the action or providing the analysis

For financial notes, include:
- note: string (the content of the note)
- related_category_id: string (if applicable)
- related_wallet_id: string (if applicable)
- context: object (any additional context as a JSON object)

When responding to questions like "Do I have money for X?" or "Should I buy X?":
1. Check their wallet balances to determine if they have sufficient funds
2. Analyze their spending patterns in related categories
3. Provide specific advice about the purchase based on their financial situation
4. Include relevant context about their overall financial health

EXAMPLE RESPONSE:
{
  "actions": [
    {
      "type": "create_note",
      "data": {
        "note": "User inquired about purchasing alcohol. Based on current discretionary spending and budget patterns, advised caution.",
        "context": { "decision_type": "purchase_inquiry", "item": "alcohol" }
      },
      "message": "I've made a note about this financial decision."
    },
    {
      "type": "respond",
      "data": null,
      "message": "Looking at your current wallet balance of $245, you technically have enough money to purchase alcohol. However, I noticed you've already spent $120 on entertainment this month, which is 20% higher than your usual amount. I'd recommend limiting additional discretionary spending until your next income deposit arrives next week."
    }
  ]
}
`;
    }
}
exports.AIService = AIService;
