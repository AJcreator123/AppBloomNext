// src/data/speciesList.ts

import plantProfiles from "../engine/plantProfiles";

/**
 * Species list derived directly from the plant database.
 * This guarantees every selectable species exists in the model.
 */
const speciesList = plantProfiles
  .map((p) => ({
    key: p.commonName,   // canonical identifier
    label: p.commonName // what the user sees
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

export default speciesList;
