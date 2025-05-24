import { Database } from "../database.types";
import supabase from "./supabaseClient";

export type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
export type TransactionInsert = Database["public"]["Tables"]["transactions"]["Insert"];
export type TransactionUpdate = Database["public"]["Tables"]["transactions"]["Update"];

/**
 * Fetches a transaction by its ID
 * @param transactionId - The UUID of the transaction to fetch
 * @returns The transaction object
 * @throws Error if the transaction cannot be fetched
 */
export const fetchTransaction = async (transactionId: string): Promise<Transaction> => {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", transactionId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch transaction with ID ${transactionId}: ${error.message}`);
  }
  return data;
};

/**
 * Fetches all transactions
 * @returns Array of transaction objects
 * @throws Error if transactions cannot be fetched
 */
export const fetchAllTransactions = async (): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch transactions: ${error.message}`);
  }
  return data;
};

/**
 * Fetches transactions for a specific wallet
 * @param walletId - The UUID of the wallet
 * @returns Array of transaction objects for the specified wallet
 * @throws Error if transactions cannot be fetched
 */
export const fetchTransactionsByWallet = async (walletId: string): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("wallet_id", walletId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch transactions for wallet ID ${walletId}: ${error.message}`);
  }
  return data;
};

/**
 * Fetches transactions by type (in/out)
 * @param type - The transaction type ('in' or 'out')
 * @returns Array of transaction objects of the specified type
 * @throws Error if transactions cannot be fetched
 */
export const fetchTransactionsByType = async (type: "in" | "out"): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("type", type)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch transactions of type ${type}: ${error.message}`);
  }
  return data;
};

/**
 * Fetches transactions by category
 * @param categoryId - The UUID of the category
 * @returns Array of transaction objects for the specified category
 * @throws Error if transactions cannot be fetched
 */
export const fetchTransactionsByCategory = async (categoryId: string): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("category_id", categoryId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch transactions for category ID ${categoryId}: ${error.message}`);
  }
  return data;
};

/**
 * Creates a new transaction
 * @param transaction - The transaction data to insert
 * @returns The created transaction object
 * @throws Error if transaction creation fails
 */
export const createTransaction = async (transaction: TransactionInsert): Promise<Transaction> => {
  const { data, error } = await supabase
    .from("transactions")
    .insert([transaction])
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create transaction: ${error.message}`);
  }
  return data;
};

/**
 * Updates an existing transaction
 * @param transactionId - The UUID of the transaction to update
 * @param transaction - The transaction data to update
 * @returns The updated transaction object
 * @throws Error if transaction update fails
 */
export const updateTransaction = async (
  transactionId: string,
  transaction: TransactionUpdate
): Promise<Transaction> => {
  const { data, error } = await supabase
    .from("transactions")
    .update(transaction)
    .eq("id", transactionId)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to update transaction with ID ${transactionId}: ${error.message}`);
  }
  return data;
};

/**
 * Deletes a transaction by its ID
 * @param transactionId - The UUID of the transaction to delete
 * @throws Error if transaction deletion fails
 */
export const deleteTransaction = async (transactionId: string): Promise<void> => {
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", transactionId);

  if (error) {
    throw new Error(`Failed to delete transaction with ID ${transactionId}: ${error.message}`);
  }
}; 