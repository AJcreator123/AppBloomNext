// src/data/speciesModel.ts
import { PlantSpecies } from "../types/PlantSpecies";

export const speciesModel: Record<string, PlantSpecies> = {
  "monstera-deliciosa": {
    id: "monstera-deliciosa",
    commonName: "Monstera Deliciosa",
    scientificName: "Monstera deliciosa",
    defaultImage:
      "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2",
    ideal: {
      temperature: { min: 18, max: 28 },
      humidity: { min: 50, max: 70 },
      moisture: { min: 60, max: 80 },
      light: { min: 500, max: 2000 },
    },
    description:
      "A tropical plant that thrives in bright, indirect light and moderate humidity. Iconic for its split leaves."
  },

  "peace-lily": {
    id: "peace-lily",
    commonName: "Peace Lily",
    scientificName: "Spathiphyllum wallisii",
    defaultImage:
      "https://hips.hearstapps.com/hmg-prod/images/lily-of-the-valley-royalty-free-image-1717536999.jpg",
    ideal: {
      temperature: { min: 18, max: 26 },
      humidity: { min: 50, max: 80 },
      moisture: { min: 60, max: 85 },
      light: { min: 100, max: 800 },
    },
    description:
      "A resilient indoor plant known for its white blooms and ability to tolerate low light."
  },

  "snake-plant": {
    id: "snake-plant",
    commonName: "Snake Plant",
    scientificName: "Sansevieria trifasciata",
    defaultImage:
      "https://randomplant.s3.amazonaws.com/snakeplant-highres.jpg",
    ideal: {
      temperature: { min: 16, max: 30 },
      humidity: { min: 30, max: 50 },
      moisture: { min: 30, max: 50 },
      light: { min: 50, max: 1500 },
    },
    description:
      "A hardy low-maintenance plant that thrives in almost any light and survives low humidity."
  }
};
