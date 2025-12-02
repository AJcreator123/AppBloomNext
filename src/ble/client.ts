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

// Your ESP32 service UUID
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
 * Scan for BloomPot devices
 */
export async function scanForPots(
  onDeviceFound: (d: Device) => void
) {
  await requestPermissions();

  console.log("🔍 Starting BLE scan…");

  const stop = manager.startDeviceScan(
    null, // Remove the filter to scan for all devices
    { scanMode: 2 },
    (error, device) => {
      if (error) {
        console.log("Scan error:", error);
        return;
      }
      if (!device) return;

      const name =
        device.name ??
        device.localName ??
        "";
      console.log("🔍 Found device:", device.name); // Log all devices

      // Call the callback for every device found
      onDeviceFound(device);
    }
  );

  // Return stop function
  return () => {
    console.log("🛑 Stopping scan");
    manager.stopDeviceScan();
    stop && stop.remove?.();
  };
}

/**
 * Connect + discover services
 */
export async function connectToDevice(deviceId: string): Promise<Device> {
  const device = await manager.connectToDevice(deviceId, { autoConnect: false });

  // Force Android to refresh BLE GATT cache
  await device.discoverAllServicesAndCharacteristics();
  await device.requestMTU(256);

  return device;
}

/**
 * Write password over BLE in base64
 */
export async function writePassword(
  deviceId: string,
  serviceUUID: string,
  characteristicUUID: string,
  password: string
) {
  const base64 = Buffer.from(password, "utf8").toString("base64");

  console.log("🔐 Sending password");

  return await manager.writeCharacteristicWithResponseForDevice(
    deviceId,
    serviceUUID,
    characteristicUUID,
    base64
  );
}

/**
 * Listen for notify messages ("OK" / "FAIL")
 */
export async function listenForResponse(
  deviceId: string,
  serviceUUID: string,
  characteristicUUID: string,
  callback: (text: string) => void
): Promise<Subscription> {
  console.log("👂 Listening for BLE response…");

  return manager.monitorCharacteristicForDevice(
    deviceId,
    serviceUUID,
    characteristicUUID,
    (error, characteristic: Characteristic | null) => {
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
}
