// src/hooks/useSelectedPlant.ts
import { useEffect, useState, useCallback } from "react";
import plantProfiles, { PlantProfile } from "../engine/plantProfiles";
import { getSelectedPlantIndex, setSelectedPlantIndex } from "../state/plantSelection";

export function useSelectedPlant() {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const idx = await getSelectedPlantIndex();
      setSelectedIndex(idx < plantProfiles.length ? idx : 0);
      setIsLoaded(true);
    })();
  }, []);

  const setPlantByIndex = useCallback(async (idx: number) => {
    const safe = Math.max(0, Math.min(idx, plantProfiles.length - 1));
    setSelectedIndex(safe);
    await setSelectedPlantIndex(safe);
  }, []);

  const plant: PlantProfile = plantProfiles[selectedIndex] ?? plantProfiles[0];

  return { plant, selectedIndex, setPlantByIndex, isLoaded, allPlants: plantProfiles };
}
