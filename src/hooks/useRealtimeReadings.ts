// src/hooks/useRealtimeReadings.ts
import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useReadingsStore } from "../store/readingsStore";
import type { PotReading } from "../types/PotReading";

export function useRealtimeReadings() {
  const setReading = useReadingsStore((s) => s.setReading);
  const setError = useReadingsStore((s) => s.setError);

  useEffect(() => {
    let isMounted = true;

    // -------------------------
    // 1) INITIAL FETCH (SAFE)
    // -------------------------
    const fetchInitial = async () => {
      try {
        const { data, error } = await supabase
          .from("plant_readings")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(); // ⭐ never throws when empty

        if (error) {
          console.error("🔥 Initial fetch full error:", error);
          if (isMounted) setError(error.message);
          return;
        }

        if (data && isMounted) {
          console.log("🌱 Initial reading loaded:", data);
          setReading(data as PotReading);
          setError(null);
        } else {
          console.log("ℹ No initial readings found (table empty).");
        }
      } catch (e: any) {
        console.error("🔥 Unexpected initial fetch error:", e);
        if (isMounted) setError(String(e.message ?? e));
      }
    };

    fetchInitial();

    // -------------------------
    // 2) REALTIME SUBSCRIPTION
    // -------------------------
    console.log("📡 Subscribing to realtime plant_readings…");

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
          if (!isMounted) return;

          console.log("📡 Realtime update received:", payload.new);

          setReading(payload.new as PotReading);
          setError(null);
        }
      )
      .subscribe((status) => {
        console.log("🔌 Realtime subscription status:", status);

        if (status === "CHANNEL_ERROR") {
          console.error("❌ Realtime subscription failure");
          if (isMounted) setError("Realtime connection error");
        }
      });

    // -------------------------
    // 3) CLEANUP
    // -------------------------
    return () => {
      isMounted = false;
      console.log("🔌 Unsubscribing from realtime readings…");
      supabase.removeChannel(channel);
    };
  }, [setReading, setError]);
}
