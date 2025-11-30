// src/hooks/useRealtimeReadings.ts
import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useReadingsStore } from "../store/readingsStore";
import type { PotReading } from "../types/PotReading";

/**
 * Hook to subscribe to realtime readings from Supabase
 * 
 * This is the BETTER alternative to useLiveReadings:
 * - ⚡ Instant updates (no polling delay)
 * - 🔋 Better battery life (only updates when data changes)
 * - 💰 Lower costs (no constant HTTP requests)
 * 
 * To use: Replace useLiveReadings() with useRealtimeReadings()
 */
export function useRealtimeReadings() {
  const setReading = useReadingsStore((s) => s.setReading);
  const setError = useReadingsStore((s) => s.setError);

  useEffect(() => {
    let isMounted = true;

    // Fetch initial reading
    const fetchInitial = async () => {
      try {
        const { data, error } = await supabase
          .from("plant_readings")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (error) throw error;

        if (data && isMounted) {
          setReading(data as PotReading);
          setError(null);
        }
      } catch (error) {
        if (isMounted) {
          const errorMessage = error instanceof Error ? error.message : "Failed to fetch initial reading";
          console.error("Initial fetch error:", errorMessage);
          setError(errorMessage);
        }
      }
    };

    fetchInitial();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("plant_readings_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "plant_readings",
        },
        (payload) => {
          if (isMounted) {
            console.log("📡 New reading received:", payload.new);
            setReading(payload.new as PotReading);
            setError(null);
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("✅ Subscribed to realtime readings");
        } else if (status === "CHANNEL_ERROR") {
          console.error("❌ Realtime subscription error");
          setError("Failed to connect to realtime updates");
        }
      });

    return () => {
      isMounted = false;
      console.log("🔌 Unsubscribing from realtime readings");
      supabase.removeChannel(channel);
    };
  }, [setReading, setError]);
}
