// src/engine/bloomModel.ts

import { PlantProfile } from './plantProfiles';

/**
 * State tracked per plant/device.
 * W, R, and stress components are continuous in [0, ...].
 */
export interface BloompotState {
  W: number;   // soil moisture (normalized)
  R: number;   // reservoir water (L, or normalized)
  SW: number;  // water stress
  ST: number;  // temperature stress
  SL: number;  // light stress
  S: number;   // total stress
  waterloggedDuration: number; // hours with W >= thetaFc
}

/**
 * Sensor inputs per step.
 * dtHours is the length of the timestep for integration.
 */
export interface SensorData {
  temperatureC: number;   // °C
  humidityPct: number;    // 0–100
  lightLux: number;       // lux (or relative)
  dtHours?: number;       // integration step in hours (default: 1 h)
}

/**
 * Watering + health recommendation outputs for the app UI.
 */
export interface BloompotStepOutput {
  pumpOn: boolean;
  reason: string; // human-readable explanation
  status: {
    moisture: number;
    reservoir: number;
    stress: {
      total: number;
      water: number;
      temperature: number;
      light: number;
    };
    env: {
      temperatureC: number;
      humidityPct: number;
      lightLux: number;
    };
  };
  advice: {
    water: string;
    light: string;
    temperature: string;
    overall: string;
  };
  nextState: BloompotState;
}

// ---- Model constants & helpers ---------------------------------------------
// These are generic defaults for all houseplants. You can later move them
// into the JSON if you want to customize by species.

const DEFAULT_TEMP_OPT = 22;     // °C, optimal indoor
const DEFAULT_TEMP_MIN = 10;     // °C, too cold below this
const DEFAULT_TEMP_MAX = 30;     // °C, too hot above this
const HUMIDITY_REF = 60;         // % relative humidity reference
const POT_VOLUME_L = 1.0;        // normalized pot volume for I = Q/Vpot

function clamp(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, x));
}

function pos(x: number): number {
  return x > 0 ? x : 0;
}

// ---- Initialization ---------------------------------------------------------

/**
 * Create an initial model state for a given plant profile.
 */
export function createInitialBloompotState(
  profile: PlantProfile
): BloompotState {
  return {
    W: profile.WInit,
    R: profile.RInit,
    SW: 0,
    ST: 0,
    SL: 0,
    S: 0,
    waterloggedDuration: 0,
  };
}

// ---- Core soil moisture model ----------------------------------------------

function computeWAvail(
  W: number,
  profile: PlantProfile
): number {
  const { thetaWp, thetaFc } = profile;
  if (W <= thetaWp) return 0;
  const denom = thetaFc - thetaWp;
  if (denom <= 0) return 0;
  const ratio = (W - thetaWp) / denom;
  return clamp(ratio, 0, 1);
}

function computeKs(
  W: number,
  profile: PlantProfile
): number {
  const { thetaWp, thetaCrit } = profile;
  if (W <= thetaWp) return 0;
  if (W >= thetaCrit) return 1;
  const denom = thetaCrit - thetaWp;
  if (denom <= 0) return 0;
  return clamp((W - thetaWp) / denom, 0, 1);
}

// ---- Environmental scaling --------------------------------------------------

function computeEta(
  temperatureC: number,
  humidityPct: number,
  profile: PlantProfile
): number {
  const { cT, cH } = profile;
  const etaT = Math.max(
    0,
    1 + cT * (temperatureC - DEFAULT_TEMP_OPT)
  );
  const etaH = Math.max(
    0,
    1 + cH * (HUMIDITY_REF - humidityPct)
  );
  return etaT * etaH;
}

// ---- Evapotranspiration -----------------------------------------------------

function computeET(
  W: number,
  temperatureC: number,
  humidityPct: number,
  profile: PlantProfile
): number {
  const { EMax, alphaEvap, nRetention } = profile;

  const WAvail = computeWAvail(W, profile);
  const Ks = computeKs(W, profile);
  const eta = computeEta(temperatureC, humidityPct, profile);

  // ET(t) = Emax * η(T, H) * [ α * Wavail^n + (1 − α) * Ks ]
  const soilComponent = alphaEvap * Math.pow(WAvail, nRetention);
  const plantComponent = (1 - alphaEvap) * Ks;
  const bracket = soilComponent + plantComponent;

  return EMax * eta * Math.max(bracket, 0);
}

// ---- Stress dynamics --------------------------------------------------------

function updateWaterStress(
  state: BloompotState,
  W: number,
  profile: PlantProfile,
  dtHours: number,
  waterloggedTerm: number
): number {
  const { kW, kRW, thetaCrit, p } = profile;
  // dSW/dt = kW * (thetaCrit − W)_+^p − kRW * SW + waterloggingTerm
  const moistureDeficit = pos(thetaCrit - W);
  const dSWdt =
    kW * Math.pow(moistureDeficit, p) -
    kRW * state.SW +
    waterloggedTerm;
  return Math.max(0, state.SW + dSWdt * dtHours);
}

function updateTemperatureStress(
  state: BloompotState,
  temperatureC: number,
  profile: PlantProfile,
  dtHours: number
): number {
  const { kT, kRT } = profile;
  // temp dev = (T − Tmax)_+ + (Tmin − T)_+
  const tempDev =
    pos(temperatureC - DEFAULT_TEMP_MAX) +
    pos(DEFAULT_TEMP_MIN - temperatureC);
  const dSTdt = kT * tempDev - kRT * state.ST;
  return Math.max(0, state.ST + dSTdt * dtHours);
}

function updateLightStress(
  state: BloompotState,
  lightLux: number,
  profile: PlantProfile,
  dtHours: number
): number {
  const { kL, kRL, LMin } = profile;
  // light def = (Lmin − L)_+
  const lightDef = pos(LMin - lightLux);
  const dSLdt = kL * lightDef - kRL * state.SL;
  return Math.max(0, state.SL + dSLdt * dtHours);
}

// ---- Waterlogging term ------------------------------------------------------

function computeWaterloggingTerm(
  W: number,
  state: BloompotState,
  profile: PlantProfile,
  dtHours: number
): { term: number; newDuration: number } {
  let newDuration = state.waterloggedDuration;
  if (W >= profile.thetaFc) {
    newDuration += dtHours;
  } else {
    newDuration = 0;
  }

  let term = 0;
  if (newDuration >= profile.tauSat) {
    term = profile.kSat; // dSW/dt += kSat
  }

  return { term, newDuration };
}

// ---- Watering logic ---------------------------------------------------------

interface WateringDecision {
  pumpOn: boolean;
  reason: string;
}

function computeWateringDecision(
  W: number,
  R: number,
  profile: PlantProfile
): WateringDecision {
  const reasons: string[] = [];

  const { thetaWp, thetaCrit, thetaFc, WMin, EMax } = profile;

  let autonomous = false;
  let sensorTriggered = false;

  // Rule 4: do not water if reservoir empty
  if (R <= 0) {
    return {
      pumpOn: false,
      reason: 'Reservoir is empty – pump off.',
    };
  }

  // Emergency watering: W < θwp
  if (W < thetaWp) {
    autonomous = true;
    reasons.push('Soil below wilting point (emergency watering).');
  }

  // Critical moisture: W < θcrit
  if (!autonomous && W < thetaCrit) {
    autonomous = true;
    reasons.push('Soil moisture below critical threshold.');
  }

  // Forecasted moisture drop within 3 hours:
  // W − θcrit < 3 * EMax
  if (
    !autonomous &&
    W - thetaCrit < 3 * EMax
  ) {
    autonomous = true;
    reasons.push('Forecasted moisture will fall below critical soon.');
  }

  // Do not water if W ≥ θfc
  if (W >= thetaFc) {
    autonomous = false;
    reasons.push('Soil near or above field capacity – skipping water.');
  }

  // Sensor threshold controller: water if W < WMin
  if (W < WMin) {
    sensorTriggered = true;
    reasons.push('Sensor detects low moisture (below sensor threshold).');
  }

  const pumpOn =
    autonomous || (!autonomous && sensorTriggered);

  if (!pumpOn && reasons.length === 0) {
    reasons.push('Moisture is in acceptable range – no watering needed.');
  }

  return {
    pumpOn,
    reason: reasons.join(' '),
  };
}

// ---- Recommendation engine --------------------------------------------------

function buildWaterAdvice(
  W: number,
  profile: PlantProfile
): string {
  const { thetaWp, thetaCrit, thetaFc } = profile;

  if (W <= thetaWp) {
    return 'Soil is extremely dry. Water immediately.';
  }
  if (W < thetaCrit) {
    return 'Soil is slightly too dry. Watering soon is recommended.';
  }
  if (W >= thetaFc * 0.95) {
    return 'Soil is very wet. Avoid watering until it dries out a bit.';
  }
  return 'Soil moisture is in a healthy range.';
}

function buildLightAdvice(
  lightLux: number,
  profile: PlantProfile
): string {
  const { LMin, lightPreference } = profile;
  const ideal = lightPreference || LMin;

  if (lightLux < 0.5 * LMin) {
    return 'Light is far below the ideal level. Move the plant to a brighter spot.';
  }
  if (lightLux < LMin) {
    return 'Light is a bit low. Slightly brighter location would help.';
  }
  if (lightLux > 2 * ideal) {
    return 'Light level is very high. Consider moving out of direct intense sun.';
  }
  return 'Light level is good for this plant.';
}

function buildTemperatureAdvice(
  temperatureC: number
): string {
  if (temperatureC < DEFAULT_TEMP_MIN) {
    return 'It is too cold for this plant. Move it to a warmer location.';
  }
  if (temperatureC > DEFAULT_TEMP_MAX) {
    return 'It is too hot for this plant. Provide some cooling or shade.';
  }
  return 'Temperature is within a comfortable range.';
}

function buildOverallAdvice(
  S: number,
  profile: PlantProfile
): string {
  const { SMax } = profile;
  const sNorm = clamp(S / SMax, 0, 1);

  if (sNorm < 0.2) {
    return 'Plant is happy and healthy.';
  }
  if (sNorm < 0.5) {
    return 'Plant has mild stress. Keep an eye on moisture, light, and temperature.';
  }
  if (sNorm < 0.8) {
    return 'Plant is stressed and needs attention soon.';
  }
  return 'Plant is in critical condition. Adjust care immediately.';
}

// ---- Main step function -----------------------------------------------------

/**
 * Core BloomPot update step.
 *
 * - Integrates moisture and stress forward by dtHours.
 * - Applies dual watering controller.
 * - Returns new state + human-readable advice for the UI.
 */
export function bloompotStep(
  prevState: BloompotState,
  sensor: SensorData,
  profile: PlantProfile
): BloompotStepOutput {
  const dtHours = sensor.dtHours ?? 1.0;

  const temperatureC = sensor.temperatureC;
  const humidityPct = sensor.humidityPct;
  const lightLux = sensor.lightLux;

  // 1. Compute watering decision based on *current* state
  const wateringDecision = computeWateringDecision(
    prevState.W,
    prevState.R,
    profile
  );
  const pumpOn = wateringDecision.pumpOn;

  // 2. Evapotranspiration
  const ET = computeET(
    prevState.W,
    temperatureC,
    humidityPct,
    profile
  );

  // 3. Irrigation input I(t) (moisture change per hour)
  // If pump is active and reservoir R > 0:
  //   I = Q / Vpot
  const I =
    pumpOn && prevState.R > 0
      ? profile.Q / POT_VOLUME_L
      : 0;

  // 4. Soil moisture dynamics: dW/dt = I(t) − ET(t)
  const WNext = clamp(
    prevState.W + (I - ET) * dtHours,
    0,
    profile.thetaFc
  );

  // 5. Reservoir dynamics: subtract Q when pump is on
  const RNext = Math.max(
    0,
    prevState.R - (pumpOn ? profile.Q * dtHours : 0)
  );

  // 6. Waterlogging term
  const waterlogging = computeWaterloggingTerm(
    WNext,
    prevState,
    profile,
    dtHours
  );

  // 7. Stress components
  const SWNext = updateWaterStress(
    prevState,
    WNext,
    profile,
    dtHours,
    waterlogging.term
  );
  const STNext = updateTemperatureStress(
    prevState,
    temperatureC,
    profile,
    dtHours
  );
  const SLNext = updateLightStress(
    prevState,
    lightLux,
    profile,
    dtHours
  );

  // 8. Total stress, capped by Smax
  const SRaw = SWNext + STNext + SLNext;
  const SNext = clamp(SRaw, 0, profile.SMax);

  const nextState: BloompotState = {
    W: WNext,
    R: RNext,
    SW: SWNext,
    ST: STNext,
    SL: SLNext,
    S: SNext,
    waterloggedDuration: waterlogging.newDuration,
  };

  // 9. Recommendation engine
  const waterAdvice = buildWaterAdvice(WNext, profile);
  const lightAdvice = buildLightAdvice(lightLux, profile);
  const tempAdvice = buildTemperatureAdvice(temperatureC);
  const overallAdvice = buildOverallAdvice(SNext, profile);

  return {
    pumpOn,
    reason: wateringDecision.reason,
    status: {
      moisture: WNext,
      reservoir: RNext,
      stress: {
        total: SNext,
        water: SWNext,
        temperature: STNext,
        light: SLNext,
      },
      env: {
        temperatureC,
        humidityPct,
        lightLux,
      },
    },
    advice: {
      water: waterAdvice,
      light: lightAdvice,
      temperature: tempAdvice,
      overall: overallAdvice,
    },
    nextState,
  };
}
