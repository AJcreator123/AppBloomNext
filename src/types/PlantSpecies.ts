// src/types/PlantSpecies.ts
export interface PlantSpecies {
  id: string;
  commonName: string;
  scientificName: string;

  defaultImage: string;

  ideal: {
    temperature: { min: number; max: number };
    humidity: { min: number; max: number };
    moisture: { min: number; max: number };
    light: { min: number; max: number };
  };

  description: string;
}
