// src/api/pots.ts
import { supabase } from "../lib/supabase";
import type { PotReading } from "../types/PotReading";

export async function fetchLatestReading(): Promise<PotReading | null> {
  try {
    console.log("🌐 Fetching from Supabase:", supabase.supabaseUrl);

    const { data, error } = await supabase
      .from("plant_readings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error("❌ Supabase error:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log("✅ Fetched reading:", data);
    return data as PotReading;
  } catch (error) {
    console.error("❌ Failed to fetch latest reading:", error);

    // Check if it's a network error
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        throw new Error("Network error: Check your internet connection");
      }
      if (error.message.includes('hostname')) {
        throw new Error("Server not found: Supabase project may be paused or deleted");
      }
    }

    throw error;
  }
}
