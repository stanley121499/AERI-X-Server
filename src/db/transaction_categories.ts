import { Database } from "../database.types";
import supabase from "./supabaseClient";

export type TransactionCategory = Database["public"]["Tables"]["transaction_categories"]["Row"];
export type TransactionCategoryInsert = Database["public"]["Tables"]["transaction_categories"]["Insert"];
export type TransactionCategoryUpdate = Database["public"]["Tables"]["transaction_categories"]["Update"];

/**
 * Fetches a transaction category by its ID
 * @param categoryId - The UUID of the category to fetch
 * @returns The transaction category object
 * @throws Error if the category cannot be fetched
 */
export const fetchTransactionCategory = async (categoryId: string): Promise<TransactionCategory> => {
  const { data, error } = await supabase
    .from("transaction_categories")
    .select("*")
    .eq("id", categoryId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch category with ID ${categoryId}: ${error.message}`);
  }
  return data;
};

/**
 * Fetches all transaction categories
 * @returns Array of transaction category objects
 * @throws Error if categories cannot be fetched
 */
export const fetchAllTransactionCategories = async (): Promise<TransactionCategory[]> => {
  const { data, error } = await supabase
    .from("transaction_categories")
    .select("*");

  if (error) {
    throw new Error(`Failed to fetch transaction categories: ${error.message}`);
  }
  return data;
};

/**
 * Fetches transaction categories by type (in/out)
 * @param type - The category type ('in' or 'out')
 * @returns Array of transaction category objects of the specified type
 * @throws Error if categories cannot be fetched
 */
export const fetchTransactionCategoriesByType = async (type: "in" | "out"): Promise<TransactionCategory[]> => {
  const { data, error } = await supabase
    .from("transaction_categories")
    .select("*")
    .eq("type", type);

  if (error) {
    throw new Error(`Failed to fetch transaction categories of type ${type}: ${error.message}`);
  }
  return data;
};

/**
 * Creates a new transaction category
 * @param category - The category data to insert
 * @returns The created transaction category object
 * @throws Error if category creation fails
 */
export const createTransactionCategory = async (category: TransactionCategoryInsert): Promise<TransactionCategory> => {
  const { data, error } = await supabase
    .from("transaction_categories")
    .insert([category])
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create transaction category: ${error.message}`);
  }
  return data;
};

/**
 * Updates an existing transaction category
 * @param categoryId - The UUID of the category to update
 * @param category - The category data to update
 * @returns The updated transaction category object
 * @throws Error if category update fails
 */
export const updateTransactionCategory = async (
  categoryId: string,
  category: TransactionCategoryUpdate
): Promise<TransactionCategory> => {
  const { data, error } = await supabase
    .from("transaction_categories")
    .update(category)
    .eq("id", categoryId)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to update category with ID ${categoryId}: ${error.message}`);
  }
  return data;
};

/**
 * Deletes a transaction category by its ID
 * @param categoryId - The UUID of the category to delete
 * @throws Error if category deletion fails
 */
export const deleteTransactionCategory = async (categoryId: string): Promise<void> => {
  const { error } = await supabase
    .from("transaction_categories")
    .delete()
    .eq("id", categoryId);

  if (error) {
    throw new Error(`Failed to delete category with ID ${categoryId}: ${error.message}`);
  }
}; 