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
exports.deleteTransactionCategory = exports.updateTransactionCategory = exports.createTransactionCategory = exports.fetchTransactionCategoriesByType = exports.fetchAllTransactionCategories = exports.fetchTransactionCategory = void 0;
const supabaseClient_1 = __importDefault(require("./supabaseClient"));
/**
 * Fetches a transaction category by its ID
 * @param categoryId - The UUID of the category to fetch
 * @returns The transaction category object
 * @throws Error if the category cannot be fetched
 */
const fetchTransactionCategory = (categoryId) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabaseClient_1.default
        .from("transaction_categories")
        .select("*")
        .eq("id", categoryId)
        .single();
    if (error) {
        throw new Error(`Failed to fetch category with ID ${categoryId}: ${error.message}`);
    }
    return data;
});
exports.fetchTransactionCategory = fetchTransactionCategory;
/**
 * Fetches all transaction categories
 * @returns Array of transaction category objects
 * @throws Error if categories cannot be fetched
 */
const fetchAllTransactionCategories = () => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabaseClient_1.default
        .from("transaction_categories")
        .select("*");
    if (error) {
        throw new Error(`Failed to fetch transaction categories: ${error.message}`);
    }
    return data;
});
exports.fetchAllTransactionCategories = fetchAllTransactionCategories;
/**
 * Fetches transaction categories by type (in/out)
 * @param type - The category type ('in' or 'out')
 * @returns Array of transaction category objects of the specified type
 * @throws Error if categories cannot be fetched
 */
const fetchTransactionCategoriesByType = (type) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabaseClient_1.default
        .from("transaction_categories")
        .select("*")
        .eq("type", type);
    if (error) {
        throw new Error(`Failed to fetch transaction categories of type ${type}: ${error.message}`);
    }
    return data;
});
exports.fetchTransactionCategoriesByType = fetchTransactionCategoriesByType;
/**
 * Creates a new transaction category
 * @param category - The category data to insert
 * @returns The created transaction category object
 * @throws Error if category creation fails
 */
const createTransactionCategory = (category) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabaseClient_1.default
        .from("transaction_categories")
        .insert([category])
        .select("*")
        .single();
    if (error) {
        throw new Error(`Failed to create transaction category: ${error.message}`);
    }
    return data;
});
exports.createTransactionCategory = createTransactionCategory;
/**
 * Updates an existing transaction category
 * @param categoryId - The UUID of the category to update
 * @param category - The category data to update
 * @returns The updated transaction category object
 * @throws Error if category update fails
 */
const updateTransactionCategory = (categoryId, category) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabaseClient_1.default
        .from("transaction_categories")
        .update(category)
        .eq("id", categoryId)
        .select("*")
        .single();
    if (error) {
        throw new Error(`Failed to update category with ID ${categoryId}: ${error.message}`);
    }
    return data;
});
exports.updateTransactionCategory = updateTransactionCategory;
/**
 * Deletes a transaction category by its ID
 * @param categoryId - The UUID of the category to delete
 * @throws Error if category deletion fails
 */
const deleteTransactionCategory = (categoryId) => __awaiter(void 0, void 0, void 0, function* () {
    const { error } = yield supabaseClient_1.default
        .from("transaction_categories")
        .delete()
        .eq("id", categoryId);
    if (error) {
        throw new Error(`Failed to delete category with ID ${categoryId}: ${error.message}`);
    }
});
exports.deleteTransactionCategory = deleteTransactionCategory;
