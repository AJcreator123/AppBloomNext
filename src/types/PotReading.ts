// src/types/PotReading.ts
export interface PotReading {
  id?: number;
  temperature: number;
  humidity: number;
  moisture: number;
  light: number;
  flower_state: number;
  created_at?: string;
}
