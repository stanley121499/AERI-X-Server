import { Database } from "../database.types";
import supabase from "./supabaseClient";

export type Wallet = Database["public"]["Tables"]["wallets"]["Row"];
export type WalletInsert = Database["public"]["Tables"]["wallets"]["Insert"];
export type WalletUpdate = Database["public"]["Tables"]["wallets"]["Update"];

/**
 * Fetches a single wallet by its ID
 * @param walletId - The UUID of the wallet to fetch
 * @returns The wallet object
 * @throws Error if the wallet cannot be fetched
 */
export const fetchWallet = async (walletId: string): Promise<Wallet> => {
  const { data, error } = await supabase
    .from("wallets")
    .select("*")
    .eq("id", walletId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch wallet with ID ${walletId}: ${error.message}`);
  }
  return data;
};

/**
 * Fetches all wallets
 * @returns Array of wallet objects
 * @throws Error if wallets cannot be fetched
 */
export const fetchAllWallets = async (): Promise<Wallet[]> => {
  const { data, error } = await supabase
    .from("wallets")
    .select("*");

  if (error) {
    throw new Error(`Failed to fetch wallets: ${error.message}`);
  }
  return data;
};

/**
 * Creates a new wallet
 * @param wallet - The wallet data to insert
 * @returns The created wallet object
 * @throws Error if wallet creation fails
 */
export const createWallet = async (wallet: WalletInsert): Promise<Wallet> => {
  const { data, error } = await supabase
    .from("wallets")
    .insert([wallet])
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create wallet: ${error.message}`);
  }
  return data;
};

/**
 * Updates an existing wallet
 * @param walletId - The UUID of the wallet to update
 * @param wallet - The wallet data to update
 * @returns The updated wallet object
 * @throws Error if wallet update fails
 */
export const updateWallet = async (
  walletId: string,
  wallet: WalletUpdate
): Promise<Wallet> => {
  const { data, error } = await supabase
    .from("wallets")
    .update(wallet)
    .eq("id", walletId)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to update wallet with ID ${walletId}: ${error.message}`);
  }
  return data;
};

/**
 * Deletes a wallet by its ID
 * @param walletId - The UUID of the wallet to delete
 * @throws Error if wallet deletion fails
 */
export const deleteWallet = async (walletId: string): Promise<void> => {
  const { error } = await supabase
    .from("wallets")
    .delete()
    .eq("id", walletId);

  if (error) {
    throw new Error(`Failed to delete wallet with ID ${walletId}: ${error.message}`);
  }
};

/**
 * Fetches a wallet by its name
 * @param name - The name of the wallet to fetch
 * @returns The wallet object or null if not found
 * @throws Error if there's an issue with the fetch operation
 */
export const fetchWalletByName = async (name: string): Promise<Wallet | null> => {
  const { data, error } = await supabase
    .from("wallets")
    .select("*")
    .ilike("name", name)
    .limit(1);

  if (error) {
    throw new Error(`Failed to fetch wallet with name ${name}: ${error.message}`);
  }
  
  return data && data.length > 0 ? data[0] : null;
}; 