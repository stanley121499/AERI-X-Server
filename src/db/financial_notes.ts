import { Database } from "../database.types";
import supabase from "./supabaseClient";

export type FinancialNote = Database["public"]["Tables"]["financial_notes"]["Row"];
export type FinancialNoteInsert = Database["public"]["Tables"]["financial_notes"]["Insert"];
export type FinancialNoteUpdate = Database["public"]["Tables"]["financial_notes"]["Update"];

/**
 * Fetches a financial note by its ID
 * @param noteId - The UUID of the note to fetch
 * @returns The financial note object
 * @throws Error if the note cannot be fetched
 */
export const fetchFinancialNote = async (noteId: string): Promise<FinancialNote> => {
  const { data, error } = await supabase
    .from("financial_notes")
    .select("*")
    .eq("id", noteId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch financial note with ID ${noteId}: ${error.message}`);
  }
  return data;
};

/**
 * Fetches all financial notes
 * @returns Array of financial note objects
 * @throws Error if notes cannot be fetched
 */
export const fetchAllFinancialNotes = async (): Promise<FinancialNote[]> => {
  const { data, error } = await supabase
    .from("financial_notes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch financial notes: ${error.message}`);
  }
  return data;
};

/**
 * Fetches financial notes related to a specific wallet
 * @param walletId - The UUID of the wallet
 * @returns Array of financial note objects related to the specified wallet
 * @throws Error if notes cannot be fetched
 */
export const fetchFinancialNotesByWallet = async (walletId: string): Promise<FinancialNote[]> => {
  const { data, error } = await supabase
    .from("financial_notes")
    .select("*")
    .eq("related_wallet_id", walletId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch financial notes for wallet ID ${walletId}: ${error.message}`);
  }
  return data;
};

/**
 * Fetches financial notes related to a specific category
 * @param categoryId - The UUID of the category
 * @returns Array of financial note objects related to the specified category
 * @throws Error if notes cannot be fetched
 */
export const fetchFinancialNotesByCategory = async (categoryId: string): Promise<FinancialNote[]> => {
  const { data, error } = await supabase
    .from("financial_notes")
    .select("*")
    .eq("related_category_id", categoryId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch financial notes for category ID ${categoryId}: ${error.message}`);
  }
  return data;
};

/**
 * Creates a new financial note
 * @param note - The financial note data to insert
 * @returns The created financial note object
 * @throws Error if note creation fails
 */
export const createFinancialNote = async (note: FinancialNoteInsert): Promise<FinancialNote> => {
  const { data, error } = await supabase
    .from("financial_notes")
    .insert([note])
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create financial note: ${error.message}`);
  }
  return data;
};

/**
 * Updates an existing financial note
 * @param noteId - The UUID of the note to update
 * @param note - The financial note data to update
 * @returns The updated financial note object
 * @throws Error if note update fails
 */
export const updateFinancialNote = async (
  noteId: string,
  note: FinancialNoteUpdate
): Promise<FinancialNote> => {
  const { data, error } = await supabase
    .from("financial_notes")
    .update(note)
    .eq("id", noteId)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to update financial note with ID ${noteId}: ${error.message}`);
  }
  return data;
};

/**
 * Deletes a financial note by its ID
 * @param noteId - The UUID of the note to delete
 * @throws Error if note deletion fails
 */
export const deleteFinancialNote = async (noteId: string): Promise<void> => {
  const { error } = await supabase
    .from("financial_notes")
    .delete()
    .eq("id", noteId);

  if (error) {
    throw new Error(`Failed to delete financial note with ID ${noteId}: ${error.message}`);
  }
}; 