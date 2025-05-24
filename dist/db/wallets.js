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
exports.fetchWalletByName = exports.deleteWallet = exports.updateWallet = exports.createWallet = exports.fetchAllWallets = exports.fetchWallet = void 0;
const supabaseClient_1 = __importDefault(require("./supabaseClient"));
/**
 * Fetches a single wallet by its ID
 * @param walletId - The UUID of the wallet to fetch
 * @returns The wallet object
 * @throws Error if the wallet cannot be fetched
 */
const fetchWallet = (walletId) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabaseClient_1.default
        .from("wallets")
        .select("*")
        .eq("id", walletId)
        .single();
    if (error) {
        throw new Error(`Failed to fetch wallet with ID ${walletId}: ${error.message}`);
    }
    return data;
});
exports.fetchWallet = fetchWallet;
/**
 * Fetches all wallets
 * @returns Array of wallet objects
 * @throws Error if wallets cannot be fetched
 */
const fetchAllWallets = () => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabaseClient_1.default
        .from("wallets")
        .select("*");
    if (error) {
        throw new Error(`Failed to fetch wallets: ${error.message}`);
    }
    return data;
});
exports.fetchAllWallets = fetchAllWallets;
/**
 * Creates a new wallet
 * @param wallet - The wallet data to insert
 * @returns The created wallet object
 * @throws Error if wallet creation fails
 */
const createWallet = (wallet) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabaseClient_1.default
        .from("wallets")
        .insert([wallet])
        .select("*")
        .single();
    if (error) {
        throw new Error(`Failed to create wallet: ${error.message}`);
    }
    return data;
});
exports.createWallet = createWallet;
/**
 * Updates an existing wallet
 * @param walletId - The UUID of the wallet to update
 * @param wallet - The wallet data to update
 * @returns The updated wallet object
 * @throws Error if wallet update fails
 */
const updateWallet = (walletId, wallet) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabaseClient_1.default
        .from("wallets")
        .update(wallet)
        .eq("id", walletId)
        .select("*")
        .single();
    if (error) {
        throw new Error(`Failed to update wallet with ID ${walletId}: ${error.message}`);
    }
    return data;
});
exports.updateWallet = updateWallet;
/**
 * Deletes a wallet by its ID
 * @param walletId - The UUID of the wallet to delete
 * @throws Error if wallet deletion fails
 */
const deleteWallet = (walletId) => __awaiter(void 0, void 0, void 0, function* () {
    const { error } = yield supabaseClient_1.default
        .from("wallets")
        .delete()
        .eq("id", walletId);
    if (error) {
        throw new Error(`Failed to delete wallet with ID ${walletId}: ${error.message}`);
    }
});
exports.deleteWallet = deleteWallet;
/**
 * Fetches a wallet by its name
 * @param name - The name of the wallet to fetch
 * @returns The wallet object or null if not found
 * @throws Error if there's an issue with the fetch operation
 */
const fetchWalletByName = (name) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabaseClient_1.default
        .from("wallets")
        .select("*")
        .ilike("name", name)
        .limit(1);
    if (error) {
        throw new Error(`Failed to fetch wallet with name ${name}: ${error.message}`);
    }
    return data && data.length > 0 ? data[0] : null;
});
exports.fetchWalletByName = fetchWalletByName;
