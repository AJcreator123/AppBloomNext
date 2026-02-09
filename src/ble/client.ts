import { Buffer } from 'buffer';
(global as any).Buffer = Buffer;

import {
  BleManager,
  Device,
  Characteristic,
  Subscription,
} from "react-native-ble-plx";
import { PermissionsAndroid, Platform } from "react-native";

export const manager = new BleManager();

export const SERVICE_UUID = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E";

/**
 * Request Android permissions
 */
export async function requestPermissions() {
  if (Platform.OS === "android") {
    await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ]);
  }
}

/**
 * Scan for devices
 */
export async function scanForPots(onDeviceFound: (d: Device) => void) {
  await requestPermissions();

  // Wait for Bluetooth to be powered on
  const state = await manager.state();
  console.log("📡 Bluetooth state:", state);

  if (state !== "PoweredOn") {
    console.log("⚠️ Bluetooth not ready, waiting...");
    
    // Wait up to 10 seconds for Bluetooth to become ready
    const timeout = new Promise<void>((_, reject) => 
      setTimeout(() => reject(new Error("Bluetooth did not become ready in time")), 10000)
    );
    
    const waitForBluetooth = new Promise<void>((resolve, reject) => {
      const subscription = manager.onStateChange((newState) => {
        console.log("📡 Bluetooth state changed to:", newState);
        
        if (newState === "PoweredOn") {
          subscription.remove();
          resolve();
        } else if (newState === "Unauthorized") {
          subscription.remove();
          reject(new Error("Bluetooth permission denied. Please enable Bluetooth in Settings."));
        } else if (newState === "PoweredOff") {
          subscription.remove();
          reject(new Error("Bluetooth is turned off. Please turn on Bluetooth in Settings."));
        }
      }, true);
    });

    try {
      await Promise.race([waitForBluetooth, timeout]);
    } catch (error: any) {
      console.error("❌ Bluetooth error:", error.message);
      throw error;
    }
  }

  console.log("🔍 Starting BLE scan…");

  manager.startDeviceScan(null, { scanMode: 2 }, (error, device) => {
    if (error) {
      console.log("Scan error:", error);
      return;
    }
    if (!device) return;

    onDeviceFound(device);
  });

  return () => {
    console.log("🛑 Stopping scan");
    manager.stopDeviceScan();
  };
}

/**
 * Connect + discover
 */
export async function connectToDevice(deviceId: string): Promise<Device> {
  const device = await manager.connectToDevice(deviceId, { autoConnect: false });

  await device.discoverAllServicesAndCharacteristics();
  await device.requestMTU(256);

  return device;
}

/**
 * Write over BLE
 */
export async function writePassword(
  deviceId: string,
  serviceUUID: string,
  characteristicUUID: string,
  value: string
) {
  const base64 = Buffer.from(value, "utf8").toString("base64");

  console.log("🔐 writePassword()", { char: characteristicUUID, value });

  return manager.writeCharacteristicWithResponseForDevice(
    deviceId,
    serviceUUID,
    characteristicUUID,
    base64
  );
}

/**
 * ⭐⭐⭐ FIXED VERSION ⭐⭐⭐
 * Listen for notify messages (NOT async, never awaited)
 */
export function listenForResponse(
  deviceId: string,
  serviceUUID: string,
  characteristicUUID: string,
  callback: (text: string) => void
): Subscription {
  console.log("👂 Subscribing to notifications…");

  const subscription = manager.monitorCharacteristicForDevice(
    deviceId,
    serviceUUID,
    characteristicUUID,
    (error, characteristic) => {
      if (error) {
        console.log("Notify error:", error);
        return;
      }
      if (!characteristic?.value) return;

      const decoded = Buffer.from(characteristic.value, "base64").toString("utf8");
      console.log("📩 Notify:", decoded);

      callback(decoded);
    }
  );

  return subscription; // <-- returns a real subscription
}
