// src/api/pots.ts
import { supabase } from "../lib/supabase";
import type { PotReading } from "../types/PotReading";

export async function fetchLatestReading(): Promise<PotReading | null> {
  const { data, error } = await supabase
    .from("plant_readings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.log("Supabase fetch error:", error);
    return null;
  }

  return data as PotReading;
}
