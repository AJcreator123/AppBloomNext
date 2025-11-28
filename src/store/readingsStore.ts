// src/store/readingsStore.ts
import { create } from "zustand";
import type { PotReading } from "../types/PotReading";

interface ReadingsStore {
  reading: PotReading | null;
  setReading: (reading: PotReading) => void;
}

export const useReadingsStore = create<ReadingsStore>((set) => ({
  reading: null,
  setReading: (reading) => set({ reading }),
}));
