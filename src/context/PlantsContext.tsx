// src/context/PlantsContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

// ⭐ Import updated demo plant list
import { plants as initialPlants } from "../data/plants";

import type { Plant } from "../types/Plant";

type PlantsContextType = {
  plants: Plant[];
  addPlant: (plant: Omit<Plant, "id">) => void;
  getPlantById: (id: string) => Plant | undefined;
};

const PlantsContext = createContext<PlantsContextType | undefined>(undefined);

export function PlantsProvider({ children }: { children: ReactNode }) {
  // ⭐ Use the improved demo plant list
  const [plants, setPlants] = useState<Plant[]>(initialPlants);

  const addPlant = (plant: Omit<Plant, "id">) => {
    const id = Date.now().toString();
    const newPlant: Plant = { id, ...plant };

    console.log("🌱 Adding Plant:", newPlant);

    setPlants((prev) => [...prev, newPlant]);
  };

  const getPlantById = (id: string) => plants.find((p) => p.id === id);

  return (
    <PlantsContext.Provider value={{ plants, addPlant, getPlantById }}>
      {children}
    </PlantsContext.Provider>
  );
}

export function usePlants() {
  const ctx = useContext(PlantsContext);
  if (!ctx) {
    throw new Error("usePlants must be used inside a PlantsProvider");
  }
  return ctx;
}
