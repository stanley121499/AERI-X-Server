import { Database } from "../database.types";
import supabase from "./supabaseClient";

export type WalletBalance = Database["public"]["Tables"]["wallet_balances"]["Row"];
export type WalletBalanceInsert = Database["public"]["Tables"]["wallet_balances"]["Insert"];
export type WalletBalanceUpdate = Database["public"]["Tables"]["wallet_balances"]["Update"];

/**
 * Fetches a wallet balance by wallet ID
 * @param walletId - The UUID of the wallet
 * @returns The wallet balance object
 * @throws Error if the wallet balance cannot be fetched
 */
export const fetchWalletBalance = async (walletId: string): Promise<WalletBalance> => {
  const { data, error } = await supabase
    .from("wallet_balances")
    .select("*")
    .eq("wallet_id", walletId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch balance for wallet ID ${walletId}: ${error.message}`);
  }
  return data;
};

/**
 * Fetches all wallet balances
 * @returns Array of wallet balance objects
 * @throws Error if wallet balances cannot be fetched
 */
export const fetchAllWalletBalances = async (): Promise<WalletBalance[]> => {
  const { data, error } = await supabase
    .from("wallet_balances")
    .select("*");

  if (error) {
    throw new Error(`Failed to fetch wallet balances: ${error.message}`);
  }
  return data;
};

/**
 * Creates a new wallet balance
 * @param walletBalance - The wallet balance data to insert
 * @returns The created wallet balance object
 * @throws Error if wallet balance creation fails
 */
export const createWalletBalance = async (walletBalance: WalletBalanceInsert): Promise<WalletBalance> => {
  const { data, error } = await supabase
    .from("wallet_balances")
    .insert([walletBalance])
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create wallet balance: ${error.message}`);
  }
  return data;
};

/**
 * Updates an existing wallet balance
 * @param walletId - The UUID of the wallet
 * @param walletBalance - The wallet balance data to update
 * @returns The updated wallet balance object
 * @throws Error if wallet balance update fails
 */
export const updateWalletBalance = async (
  walletId: string,
  walletBalance: WalletBalanceUpdate
): Promise<WalletBalance> => {
  const { data, error } = await supabase
    .from("wallet_balances")
    .update(walletBalance)
    .eq("wallet_id", walletId)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to update balance for wallet ID ${walletId}: ${error.message}`);
  }
  return data;
};

/**
 * Deletes a wallet balance by wallet ID
 * @param walletId - The UUID of the wallet
 * @throws Error if wallet balance deletion fails
 */
export const deleteWalletBalance = async (walletId: string): Promise<void> => {
  const { error } = await supabase
    .from("wallet_balances")
    .delete()
    .eq("wallet_id", walletId);

  if (error) {
    throw new Error(`Failed to delete balance for wallet ID ${walletId}: ${error.message}`);
  }
}; 