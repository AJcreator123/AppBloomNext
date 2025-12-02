export const plants = [
  {
    id: "1",
    name: "Monstera Deliciosa",
    species: "Monstera deliciosa",
    image:
      "https://images.unsplash.com/photo-1614594852193-9f7c4543c4bb?q=80&w=1200&auto=format&fit=crop",

    // REQUIRED: match shape of new plants
    supabasePlantId: 1,
    potMacAddress: "00:00:00:00:00:01",

    vitals: {
      temp: 22,
      moisture: 58,
      light: 1200,
      humidity: 50,
    },
  },
  {
    id: "2",
    name: "Snake Plant",
    species: "Sansevieria",
    image:
      "https://images.unsplash.com/photo-1604594849809-dfedbc827105?q=80&w=1200&auto=format&fit=crop",

    supabasePlantId: 2,
    potMacAddress: "00:00:00:00:00:02",

    vitals: {
      temp: 21,
      moisture: 41,
      light: 380,
      humidity: 50,
    },
  },
  {
    id: "3",
    name: "Peace Lily",
    species: "Spathiphyllum",
    image:
      "https://images.unsplash.com/photo-1598899134739-24e1fe3b5a00?q=80&w=1200&auto=format&fit=crop",

    supabasePlantId: 3,
    potMacAddress: "00:00:00:00:00:03",

    vitals: {
      temp: 23,
      moisture: 63,
      light: 640,
      humidity: 50,
    },
  },
];
