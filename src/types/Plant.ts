// src/types/Plant.ts

export type PlantVitals = {
  temp: number;
  moisture: number;
  light: number;
  humidity?: number;
};

export type Plant = {
  id: string;              // local app id (string)
  name: string;
  species: string;
  image: string;
  vitals?: PlantVitals;
  supabasePlantId: number; // MUST match PLANT_ID on ESP32
  potMacAddress?: string;  // future: real BLE MAC
};
