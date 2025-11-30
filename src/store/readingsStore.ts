// src/store/readingsStore.ts
import { create } from "zustand";
import type { PotReading } from "../types/PotReading";

interface ReadingsStore {
  reading: PotReading | null;
  error: string | null;
  setReading: (reading: PotReading) => void;
  setError: (error: string | null) => void;
}

export const useReadingsStore = create<ReadingsStore>((set) => ({
  reading: null,
  error: null,
  setReading: (reading) => set({ reading, error: null }),
  setError: (error) => set({ error }),
}));
