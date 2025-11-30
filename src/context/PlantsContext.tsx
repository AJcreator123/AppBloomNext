// src/context/PlantsContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import { plants as initialPlants } from "../data/plants";
import type { Plant } from "../types/Plant";

type PlantsContextType = {
  plants: Plant[];
  addPlant: (plant: Omit<Plant, "id">) => void;
  getPlantById: (id: string) => Plant | undefined;
};

const PlantsContext = createContext<PlantsContextType | undefined>(undefined);

export function PlantsProvider({ children }: { children: ReactNode }) {
  // Cast initialPlants and inject supabasePlantId defaults
  const [plants, setPlants] = useState<Plant[]>(
    initialPlants.map((p, idx) => ({
      id: p.id ?? String(idx + 1),
      name: p.name,
      species: p.species,
      image: p.image,
      vitals: p.vitals,
      supabasePlantId: idx + 1, // 1,2,3...
      potMacAddress: p.potMacAddress,
    }))
  );

  const addPlant = (plant: Omit<Plant, "id">) => {
    const id = Date.now().toString();
    setPlants((prev) => [...prev, { id, ...plant }]);
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
