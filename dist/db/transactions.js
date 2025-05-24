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
exports.deleteTransaction = exports.updateTransaction = exports.createTransaction = exports.fetchTransactionsByCategory = exports.fetchTransactionsByType = exports.fetchTransactionsByWallet = exports.fetchAllTransactions = exports.fetchTransaction = void 0;
const supabaseClient_1 = __importDefault(require("./supabaseClient"));
/**
 * Fetches a transaction by its ID
 * @param transactionId - The UUID of the transaction to fetch
 * @returns The transaction object
 * @throws Error if the transaction cannot be fetched
 */
const fetchTransaction = (transactionId) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabaseClient_1.default
        .from("transactions")
        .select("*")
        .eq("id", transactionId)
        .single();
    if (error) {
        throw new Error(`Failed to fetch transaction with ID ${transactionId}: ${error.message}`);
    }
    return data;
});
exports.fetchTransaction = fetchTransaction;
/**
 * Fetches all transactions
 * @returns Array of transaction objects
 * @throws Error if transactions cannot be fetched
 */
const fetchAllTransactions = () => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabaseClient_1.default
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });
    if (error) {
        throw new Error(`Failed to fetch transactions: ${error.message}`);
    }
    return data;
});
exports.fetchAllTransactions = fetchAllTransactions;
/**
 * Fetches transactions for a specific wallet
 * @param walletId - The UUID of the wallet
 * @returns Array of transaction objects for the specified wallet
 * @throws Error if transactions cannot be fetched
 */
const fetchTransactionsByWallet = (walletId) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabaseClient_1.default
        .from("transactions")
        .select("*")
        .eq("wallet_id", walletId)
        .order("created_at", { ascending: false });
    if (error) {
        throw new Error(`Failed to fetch transactions for wallet ID ${walletId}: ${error.message}`);
    }
    return data;
});
exports.fetchTransactionsByWallet = fetchTransactionsByWallet;
/**
 * Fetches transactions by type (in/out)
 * @param type - The transaction type ('in' or 'out')
 * @returns Array of transaction objects of the specified type
 * @throws Error if transactions cannot be fetched
 */
const fetchTransactionsByType = (type) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabaseClient_1.default
        .from("transactions")
        .select("*")
        .eq("type", type)
        .order("created_at", { ascending: false });
    if (error) {
        throw new Error(`Failed to fetch transactions of type ${type}: ${error.message}`);
    }
    return data;
});
exports.fetchTransactionsByType = fetchTransactionsByType;
/**
 * Fetches transactions by category
 * @param categoryId - The UUID of the category
 * @returns Array of transaction objects for the specified category
 * @throws Error if transactions cannot be fetched
 */
const fetchTransactionsByCategory = (categoryId) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabaseClient_1.default
        .from("transactions")
        .select("*")
        .eq("category_id", categoryId)
        .order("created_at", { ascending: false });
    if (error) {
        throw new Error(`Failed to fetch transactions for category ID ${categoryId}: ${error.message}`);
    }
    return data;
});
exports.fetchTransactionsByCategory = fetchTransactionsByCategory;
/**
 * Creates a new transaction
 * @param transaction - The transaction data to insert
 * @returns The created transaction object
 * @throws Error if transaction creation fails
 */
const createTransaction = (transaction) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabaseClient_1.default
        .from("transactions")
        .insert([transaction])
        .select("*")
        .single();
    if (error) {
        throw new Error(`Failed to create transaction: ${error.message}`);
    }
    return data;
});
exports.createTransaction = createTransaction;
/**
 * Updates an existing transaction
 * @param transactionId - The UUID of the transaction to update
 * @param transaction - The transaction data to update
 * @returns The updated transaction object
 * @throws Error if transaction update fails
 */
const updateTransaction = (transactionId, transaction) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabaseClient_1.default
        .from("transactions")
        .update(transaction)
        .eq("id", transactionId)
        .select("*")
        .single();
    if (error) {
        throw new Error(`Failed to update transaction with ID ${transactionId}: ${error.message}`);
    }
    return data;
});
exports.updateTransaction = updateTransaction;
/**
 * Deletes a transaction by its ID
 * @param transactionId - The UUID of the transaction to delete
 * @throws Error if transaction deletion fails
 */
const deleteTransaction = (transactionId) => __awaiter(void 0, void 0, void 0, function* () {
    const { error } = yield supabaseClient_1.default
        .from("transactions")
        .delete()
        .eq("id", transactionId);
    if (error) {
        throw new Error(`Failed to delete transaction with ID ${transactionId}: ${error.message}`);
    }
});
exports.deleteTransaction = deleteTransaction;
