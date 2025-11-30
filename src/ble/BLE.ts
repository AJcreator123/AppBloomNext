// src/ble/BLE.ts

import { BleManager, Device, Characteristic } from "react-native-ble-plx";
import { PermissionsAndroid, Platform } from "react-native";

export const manager = new BleManager();

// These must match ESP32 UUIDs
export const SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
export const PASSWORD_UUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
export const STATUS_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

// ---- Helpers ----
// FIX: Using btoa() and atob() for Base64 encoding/decoding, 
// as Buffer is not available by default in React Native.
export function toBase64(text: string) {
  return btoa(text);
}
export function fromBase64(b64: string) {
  return atob(b64);
}

// ---- ANDROID PERMISSION ----
async function requestPermissions() {
  if (Platform.OS === "android") {
    await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ]);
  }
}

// ---- SCAN FOR BLOOM POTS ----
export async function scanForBloomPots(
  onDeviceFound: (device: Device) => void
) {
  await requestPermissions();

  manager.startDeviceScan(null, null, (error, device) => {
    if (error) {
      console.log("Scan error:", error);
      return;
    }

    if (!device?.name) return;

    if (device.name.startsWith("BloomPot-")) {
      onDeviceFound(device);
    }
  });
}

// ---- CONNECT TO ESP32 ----
export async function connectToPot(device: Device) {
  const connected = await manager.connectToDevice(device.id);
  await connected.discoverAllServicesAndCharacteristics();
  return connected;
}

// ---- SEND PASSWORD ----
export async function sendPassword(device: Device, pwd: string) {
  const base64Pwd = toBase64(pwd);
  await device.writeCharacteristicWithResponseForService(
    SERVICE_UUID,
    PASSWORD_UUID,
    base64Pwd
  );
}

// ---- LISTEN FOR STATUS RESULT ----
export async function subscribeToStatus(
  device: Device,
  callback: (status: string) => void
) {
  return await device.monitorCharacteristicForService(
    SERVICE_UUID,
    STATUS_UUID,
    (error, char) => {
      if (error) {
        console.log("ERROR monitoring:", error);
        return;
      }

      if (!char?.value) return;

      // The BLE library provides the raw Base64 value, which we decode.
      callback(fromBase64(char.value));
    }
  );
}