// src/hooks/useLiveReadings.ts
import { useEffect } from "react";
import { fetchLatestReading } from "../api/pots";
import { useReadingsStore } from "../store/readingsStore";

export function useLiveReadings(intervalMs = 5000) {
  const setReading = useReadingsStore((s) => s.setReading);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const latest = await fetchLatestReading();
      if (latest && isMounted) {
        setReading(latest);
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
  }, [intervalMs, setReading]);
}
