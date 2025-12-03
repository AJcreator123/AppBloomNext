// src/types/Plant.ts

export type PlantVitals = {
  temp: number;
  moisture: number;
  light: number;
  humidity: number;   // REQUIRED ✅
};

export type Plant = {
  id: string;
  name: string;
  species: string;
  image: string;

  vitals: PlantVitals;       // REQUIRED ✅
  supabasePlantId: number;
  potMacAddress: string;     // REQUIRED ✅
};
