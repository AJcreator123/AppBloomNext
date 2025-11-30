// src/hooks/useLiveReadings.ts
import { useEffect } from "react";
import { fetchLatestReading } from "../api/pots";
import { useReadingsStore } from "../store/readingsStore";

/**
 * Hook to fetch live readings from Supabase
 * 
 * WARNING: This uses polling which drains battery and wastes bandwidth.
 * TODO: Replace with Supabase realtime subscriptions for instant updates
 * 
 * @param intervalMs - How often to poll (default 5000ms = 5 seconds)
 */
export function useLiveReadings(intervalMs = 5000) {
  const setReading = useReadingsStore((s) => s.setReading);
  const setError = useReadingsStore((s) => s.setError);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const latest = await fetchLatestReading();
        if (latest && isMounted) {
          setReading(latest);
          setError(null);
        }
      } catch (error) {
        if (isMounted) {
          const errorMessage = error instanceof Error ? error.message : "Failed to fetch readings";
          console.error("useLiveReadings error:", errorMessage);
          setError(errorMessage);
        }
      }
    };

    // initial load
    load();
    // poll every few seconds
    const id = setInterval(load, intervalMs);

    return () => {
      isMounted = false;
      clearInterval(id);
    };
  }, [intervalMs, setReading, setError]);
}
