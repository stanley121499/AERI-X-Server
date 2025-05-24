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
exports.deleteFinancialNote = exports.updateFinancialNote = exports.createFinancialNote = exports.fetchFinancialNotesByCategory = exports.fetchFinancialNotesByWallet = exports.fetchAllFinancialNotes = exports.fetchFinancialNote = void 0;
const supabaseClient_1 = __importDefault(require("./supabaseClient"));
/**
 * Fetches a financial note by its ID
 * @param noteId - The UUID of the note to fetch
 * @returns The financial note object
 * @throws Error if the note cannot be fetched
 */
const fetchFinancialNote = (noteId) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabaseClient_1.default
        .from("financial_notes")
        .select("*")
        .eq("id", noteId)
        .single();
    if (error) {
        throw new Error(`Failed to fetch financial note with ID ${noteId}: ${error.message}`);
    }
    return data;
});
exports.fetchFinancialNote = fetchFinancialNote;
/**
 * Fetches all financial notes
 * @returns Array of financial note objects
 * @throws Error if notes cannot be fetched
 */
const fetchAllFinancialNotes = () => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabaseClient_1.default
        .from("financial_notes")
        .select("*")
        .order("created_at", { ascending: false });
    if (error) {
        throw new Error(`Failed to fetch financial notes: ${error.message}`);
    }
    return data;
});
exports.fetchAllFinancialNotes = fetchAllFinancialNotes;
/**
 * Fetches financial notes related to a specific wallet
 * @param walletId - The UUID of the wallet
 * @returns Array of financial note objects related to the specified wallet
 * @throws Error if notes cannot be fetched
 */
const fetchFinancialNotesByWallet = (walletId) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabaseClient_1.default
        .from("financial_notes")
        .select("*")
        .eq("related_wallet_id", walletId)
        .order("created_at", { ascending: false });
    if (error) {
        throw new Error(`Failed to fetch financial notes for wallet ID ${walletId}: ${error.message}`);
    }
    return data;
});
exports.fetchFinancialNotesByWallet = fetchFinancialNotesByWallet;
/**
 * Fetches financial notes related to a specific category
 * @param categoryId - The UUID of the category
 * @returns Array of financial note objects related to the specified category
 * @throws Error if notes cannot be fetched
 */
const fetchFinancialNotesByCategory = (categoryId) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabaseClient_1.default
        .from("financial_notes")
        .select("*")
        .eq("related_category_id", categoryId)
        .order("created_at", { ascending: false });
    if (error) {
        throw new Error(`Failed to fetch financial notes for category ID ${categoryId}: ${error.message}`);
    }
    return data;
});
exports.fetchFinancialNotesByCategory = fetchFinancialNotesByCategory;
/**
 * Creates a new financial note
 * @param note - The financial note data to insert
 * @returns The created financial note object
 * @throws Error if note creation fails
 */
const createFinancialNote = (note) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabaseClient_1.default
        .from("financial_notes")
        .insert([note])
        .select("*")
        .single();
    if (error) {
        throw new Error(`Failed to create financial note: ${error.message}`);
    }
    return data;
});
exports.createFinancialNote = createFinancialNote;
/**
 * Updates an existing financial note
 * @param noteId - The UUID of the note to update
 * @param note - The financial note data to update
 * @returns The updated financial note object
 * @throws Error if note update fails
 */
const updateFinancialNote = (noteId, note) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabaseClient_1.default
        .from("financial_notes")
        .update(note)
        .eq("id", noteId)
        .select("*")
        .single();
    if (error) {
        throw new Error(`Failed to update financial note with ID ${noteId}: ${error.message}`);
    }
    return data;
});
exports.updateFinancialNote = updateFinancialNote;
/**
 * Deletes a financial note by its ID
 * @param noteId - The UUID of the note to delete
 * @throws Error if note deletion fails
 */
const deleteFinancialNote = (noteId) => __awaiter(void 0, void 0, void 0, function* () {
    const { error } = yield supabaseClient_1.default
        .from("financial_notes")
        .delete()
        .eq("id", noteId);
    if (error) {
        throw new Error(`Failed to delete financial note with ID ${noteId}: ${error.message}`);
    }
});
exports.deleteFinancialNote = deleteFinancialNote;
