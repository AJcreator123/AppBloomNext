// src/models/speciesModel.ts
// Deterministic species model (100+ species)

export interface SpeciesModel {
  id: string;
  name: string;
  defaultImage: string;
  description: string;

  ideal: {
    temperature: [number, number];
    humidity: [number, number];
    moisture: [number, number];
    light: [number, number];
  };
}

export const SPECIES_LIST: SpeciesModel[] = [
  {
    id: "monstera",
    name: "Monstera Deliciosa",
    defaultImage:
      "https://images.unsplash.com/photo-1614594975527-1ad298d50d2e",
    description: "A tropical plant known for its split leaves.",
    ideal: {
      temperature: [18, 28],
      humidity: [50, 70],
      moisture: [60, 80],
      light: [500, 2000],
    },
  },

  {
    id: "snake_plant",
    name: "Snake Plant",
    defaultImage:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6",
    description:
      "Extremely hardy plant that tolerates low light and drought.",
    ideal: {
      temperature: [16, 29],
      humidity: [30, 50],
      moisture: [20, 40],
      light: [100, 1500],
    },
  },

  {
    id: "peace_lily",
    name: "Peace Lily",
    defaultImage:
      "https://images.unsplash.com/photo-1524594081293-190a2fe0a16f",
    description: "Thrives in medium to low light, loves humidity.",
    ideal: {
      temperature: [18, 27],
      humidity: [50, 80],
      moisture: [60, 90],
      light: [100, 800],
    },
  },

  // ----------------------------------------------------
  // Below are 100 more species (deterministic, consistent)
  // ----------------------------------------------------
  ...[
    "Areca Palm",
    "ZZ Plant",
    "Pothos Golden",
    "Pothos Marble Queen",
    "Chinese Evergreen",
    "Rubber Plant",
    "Fiddle Leaf Fig",
    "Dieffenbachia",
    "Calathea Makoyana",
    "Calathea Orbifolia",
    "Calathea Medallion",
    "Spider Plant",
    "Bird of Paradise",
    "Dracaena Marginata",
    "Dracaena Compacta",
    "Jade Plant",
    "Aloe Vera",
    "Succulent Mix",
    "Cactus Mix",
    "English Ivy",
    "Boston Fern",
    "Asparagus Fern",
    "Hoya Carnosa",
    "Hoya Australis",
    "Nerve Plant",
    "Prayer Plant",
    "Lucky Bamboo",
    "Bonsai Ficus",
    "Bonsai Juniper",
    "Schefflera",
    "Croton",
    "Anthurium",
    "Aglaonema Red",
    "Aglaonema Silver Bay",
    "Banana Plant",
    "Coffee Plant",
    "Air Plant",
    "Oxalis Triangularis",
    "Pilea Peperomioides",
    "String of Pearls",
    "String of Hearts",
    "String of Dolphins",
    "Philodendron Brasil",
    "Philodendron Pink Princess",
    "Philodendron White Knight",
    "Philodendron Birkin",
    "Philodendron Micans",
    "Philodendron Lemon Lime",
    "Alocasia Polly",
    "Alocasia Amazonica",
    "Alocasia Frydek",
    "Syngonium Pink",
    "Syngonium Green",
    "Syngonium White",
    "Money Plant",
    "Rubber Plant Burgundy",
    "Rubber Plant Tineke",
    "Bird’s Nest Fern",
    "Staghorn Fern",
    "Maidenhair Fern",
    "Christmas Cactus",
    "Easter Cactus",
    "Ponytail Palm",
    "Norfolk Pine",
    "Swiss Cheese Plant",
    "Purple Shamrock",
    "Coleus",
    "Sedum",
    "Peperomia Green",
    "Peperomia Watermelon",
    "Peperomia Obtusifolia",
    "Peperomia Ginny",
    "Haworthia",
    "Kalanchoe",
    "Echeveria Blue",
    "Echeveria Purple",
    "Echeveria Green",
    "Yucca Cane",
    "Umbrella Plant",
    "Cast Iron Plant",
    "Rex Begonia",
    "Begonia Maculata",
    "Arrowhead Vine",
    "Lipstick Plant",
    "Goldfish Plant",
    "Bamboo Palm",
    "Kentia Palm",
    "Majesty Palm",
    "Sago Palm",
    "Mini Cactus Red",
    "Mini Cactus Yellow",
    "Mini Cactus Green",
    "Sedeveria",
    "Aeonium",
    "Pachira Money Tree",
    "Dwarf Banana",
    "Bromeliad",
    "Tradescantia",
    "Tradescantia Nanouk",
    "Spiderwort",
    "Ctenanthe Setosa",
  ].map((name, i) => ({
    id: name.toLowerCase().replace(/[^a-z]/g, "") + i,
    name,
    defaultImage:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6",
    description: `A healthy indoor plant known as ${name}.`,
    ideal: {
      temperature: [18, 28],
      humidity: [40, 70],
      moisture: [40, 70],
      light: [200, 2000],
    },
  })),
];
