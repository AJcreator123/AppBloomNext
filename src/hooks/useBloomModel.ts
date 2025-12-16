import { useState, useCallback } from 'react';
import plantProfiles from '../engine/plantProfiles';
import {
  createInitialBloompotState,
  bloompotStep,
  BloompotState,
  BloompotStepOutput,
} from '../engine/bloomModel';

export function useBloomModel(selectedPlantIndex: number = 0) {
  const plant = plantProfiles[selectedPlantIndex];

  const [state, setState] = useState<BloompotState>(
    () => createInitialBloompotState(plant)
  );

  const [lastOutput, setLastOutput] =
    useState<BloompotStepOutput | null>(null);

  const processSensorData = useCallback(
    (sensor: {
      temperatureC: number;
      humidityPct: number;
      lightLux: number;
      dtHours?: number;
    }) => {
      const result = bloompotStep(state, sensor, plant);
      setState(result.nextState);
      setLastOutput(result);
      return result;
    },
    [state, plant]
  );

  return { state, lastOutput, processSensorData, plant };
}
