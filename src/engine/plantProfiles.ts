// src/engine/plantProfiles.ts

import rawProfiles from '../../assets/plant_schema.json';

export type WaterPreference =
  | 'evenly_moist'
  | 'dry_between'
  | string;

export type PlantCategory =
  | 'tropical'
  | 'bulb'
  | 'fern'
  | 'orchid'
  | 'edible'
  | string;

export interface PlantProfile {
  commonName: string;
  scientificName: string;
  category: PlantCategory;

  // Environmental preferences
  lightPreference: number;
  waterPreference: WaterPreference;

  // Moisture thresholds
  thetaWp: number;
  thetaCrit: number;
  thetaFc: number;
  WMin: number;

  // Light threshold
  LMin: number;

  // Stress parameters (water)
  kW: number;
  kRW: number;
  p: number;

  // Stress parameters (temperature)
  kT: number;
  kRT: number;

  // Stress parameters (light)
  kL: number;
  kRL: number;

  // Evapotranspiration
  alphaEvap: number;
  EMax: number;
  nRetention: number;

  // Environmental scaling
  cT: number;
  cH: number;

  // Stress cap
  SMax: number;

  // Waterlogging
  kSat: number;
  tauSat: number;

  // Pump/reservoir
  Q: number;
  WInit: number;
  RInit: number;
}

// Cast raw JSON into typed array
const plantProfiles = rawProfiles as PlantProfile[];

/**
 * Get a plant profile by exact common name (case-insensitive).
 */
export function findPlantProfileByCommonName(
  name: string
): PlantProfile | undefined {
  const lower = name.trim().toLowerCase();
  return plantProfiles.find(
    (p) => p.commonName.trim().toLowerCase() === lower
  );
}

/**
 * Fuzzy search in common names.
 */
export function searchPlantProfiles(
  query: string
): PlantProfile[] {
  const lower = query.trim().toLowerCase();
  if (!lower) return plantProfiles;
  return plantProfiles.filter((p) =>
    p.commonName.toLowerCase().includes(lower)
  );
}

export default plantProfiles;
