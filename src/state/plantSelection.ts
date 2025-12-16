// src/state/plantSelection.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "bloom:selectedPlantIndex:v1";

export async function getSelectedPlantIndex(): Promise<number> {
  const raw = await AsyncStorage.getItem(KEY);
  const n = raw == null ? NaN : Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export async function setSelectedPlantIndex(index: number): Promise<void> {
  await AsyncStorage.setItem(KEY, String(index));
}
