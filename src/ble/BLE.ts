// src/ble/BLE.ts
import { BleManager, Device, Characteristic } from "react-native-ble-plx";
import { PermissionsAndroid, Platform, Alert } from "react-native";
import { Buffer } from "buffer";

export const manager = new BleManager();

// These must match ESP32 UUIDs
export const SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
export const PASSWORD_UUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
export const STATUS_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

// ---- Helpers ----
export function toBase64(text: string): string {
  return Buffer.from(text, "utf8").toString("base64");
}

export function fromBase64(b64: string): string {
  return Buffer.from(b64, "base64").toString("utf8");
}

// ---- ANDROID PERMISSION ----
async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === "android") {
    try {
      const results = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);
      
      const allGranted = Object.values(results).every(
        (status) => status === PermissionsAndroid.RESULTS.GRANTED
      );
      
      if (!allGranted) {
        Alert.alert(
          "Permissions Required",
          "Bluetooth permissions are needed to connect to your plant pot."
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error("Permission error:", error);
      Alert.alert("Error", "Failed to request Bluetooth permissions");
      return false;
    }
  }
  return true; // iOS permissions handled via Info.plist
}

// ---- CONNECT TO ESP32 ----
export async function connectToPot(device: Device): Promise<Device> {
  try {
    const connected = await manager.connectToDevice(device.id);
    await connected.discoverAllServicesAndCharacteristics();
    return connected;
  } catch (error) {
    console.error("Connection error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to connect";
    Alert.alert("Connection Failed", errorMessage);
    throw error;
  }
}

// ---- SEND PASSWORD ----
export async function sendPassword(device: Device, pwd: string): Promise<void> {
  try {
    const base64Pwd = toBase64(pwd);
    await device.writeCharacteristicWithResponseForService(
      SERVICE_UUID,
      PASSWORD_UUID,
      base64Pwd
    );
  } catch (error) {
    console.error("Failed to send password:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to send password";
    Alert.alert("Authentication Failed", errorMessage);
    throw error;
  }
}

// ---- LISTEN FOR STATUS RESULT ----
export async function subscribeToStatus(
  device: Device,
  callback: (status: string) => void,
  onError?: (error: Error) => void
): Promise<any> {
  try {
    return await device.monitorCharacteristicForService(
      SERVICE_UUID,
      STATUS_UUID,
      (error, char) => {
        if (error) {
          console.error("Monitoring error:", error);
          onError?.(error);
          return;
        }

        if (!char?.value) return;

        try {
          const decodedValue = fromBase64(char.value);
          callback(decodedValue);
        } catch (decodeError) {
          console.error("Failed to decode BLE value:", decodeError);
          onError?.(decodeError instanceof Error ? decodeError : new Error("Decode failed"));
        }
      }
    );
  } catch (error) {
    console.error("Failed to subscribe to status:", error);
    const errorMessage = error instanceof Error ? error.message : "Subscription failed";
    Alert.alert("Monitoring Failed", errorMessage);
    onError?.(error instanceof Error ? error : new Error(errorMessage));
    throw error;
  }
}