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
exports.deleteWalletBalance = exports.updateWalletBalance = exports.createWalletBalance = exports.fetchAllWalletBalances = exports.fetchWalletBalance = void 0;
const supabaseClient_1 = __importDefault(require("./supabaseClient"));
/**
 * Fetches a wallet balance by wallet ID
 * @param walletId - The UUID of the wallet
 * @returns The wallet balance object
 * @throws Error if the wallet balance cannot be fetched
 */
const fetchWalletBalance = (walletId) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabaseClient_1.default
        .from("wallet_balances")
        .select("*")
        .eq("wallet_id", walletId)
        .single();
    if (error) {
        throw new Error(`Failed to fetch balance for wallet ID ${walletId}: ${error.message}`);
    }
    return data;
});
exports.fetchWalletBalance = fetchWalletBalance;
/**
 * Fetches all wallet balances
 * @returns Array of wallet balance objects
 * @throws Error if wallet balances cannot be fetched
 */
const fetchAllWalletBalances = () => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabaseClient_1.default
        .from("wallet_balances")
        .select("*");
    if (error) {
        throw new Error(`Failed to fetch wallet balances: ${error.message}`);
    }
    return data;
});
exports.fetchAllWalletBalances = fetchAllWalletBalances;
/**
 * Creates a new wallet balance
 * @param walletBalance - The wallet balance data to insert
 * @returns The created wallet balance object
 * @throws Error if wallet balance creation fails
 */
const createWalletBalance = (walletBalance) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabaseClient_1.default
        .from("wallet_balances")
        .insert([walletBalance])
        .select("*")
        .single();
    if (error) {
        throw new Error(`Failed to create wallet balance: ${error.message}`);
    }
    return data;
});
exports.createWalletBalance = createWalletBalance;
/**
 * Updates an existing wallet balance
 * @param walletId - The UUID of the wallet
 * @param walletBalance - The wallet balance data to update
 * @returns The updated wallet balance object
 * @throws Error if wallet balance update fails
 */
const updateWalletBalance = (walletId, walletBalance) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabaseClient_1.default
        .from("wallet_balances")
        .update(walletBalance)
        .eq("wallet_id", walletId)
        .select("*")
        .single();
    if (error) {
        throw new Error(`Failed to update balance for wallet ID ${walletId}: ${error.message}`);
    }
    return data;
});
exports.updateWalletBalance = updateWalletBalance;
/**
 * Deletes a wallet balance by wallet ID
 * @param walletId - The UUID of the wallet
 * @throws Error if wallet balance deletion fails
 */
const deleteWalletBalance = (walletId) => __awaiter(void 0, void 0, void 0, function* () {
    const { error } = yield supabaseClient_1.default
        .from("wallet_balances")
        .delete()
        .eq("wallet_id", walletId);
    if (error) {
        throw new Error(`Failed to delete balance for wallet ID ${walletId}: ${error.message}`);
    }
});
exports.deleteWalletBalance = deleteWalletBalance;
