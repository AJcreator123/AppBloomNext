// src/ble/BLE.ts
import { BleManager } from "react-native-ble-plx";
import { PermissionsAndroid, Platform } from "react-native";

export const manager = new BleManager();

export async function initBLE() {
  console.log("🔥 initBLE() called");
}

export async function scanForPots(onDeviceFound: (device: any) => void) {
  console.log("🔥 scanForPots() STARTED");

  // --- ANDROID PERMISSIONS ---
  if (Platform.OS === "android") {
    console.log("Requesting Android permissions…");

    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ]);

    console.log("Permission result:", granted);
  }

  console.log("Starting BLE scan…");

  return manager.startDeviceScan(null, null, (error, device) => {
    if (error) {
      console.log("❌ Scan error:", error);
      return;
    }

    if (!device?.name) return;

    console.log("📡 Found device:", device.name);

    if (device.name.startsWith("BloomPot")) {
      console.log("🎉 BloomPot found!", device.id);
      onDeviceFound(device);
    }
  });
}

export async function connectToPot(id: string) {
  console.log("🔌 Connecting to", id);
  return manager.connectToDevice(id);
}

export async function writePassword(id: string, pwd: string) {
  console.log("✏️ Writing password:", pwd);
}

export async function listenForPasswordResponse(id: string, cb: any) {
  console.log("👂 Listening for password response");
  return () => {};
}
