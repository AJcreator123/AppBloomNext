// src/screens/AddPlantScreen.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
} from "react-native";

import colors from "../theme/colors";
import { fonts } from "../theme/typography";
import { usePlants } from "../context/PlantsContext";

import {
  scanForPots,
  connectToDevice,
  writePassword,
  listenForResponse,
  SERVICE_UUID,
} from "../ble/client";

import {
  SSID_CHAR_UUID,
  PASS_CHAR_UUID,
  CONNECT_CHAR_UUID,
  STATUS_CHAR_UUID
} from "../ble/uuids";

type NearbyPot = {
  id: string;
  name: string;
  macAddress: string;
  plant_id: number;
};

export default function AddPlantScreen({ navigation }: any) {
  const { addPlant } = usePlants();

  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [isScanning, setIsScanning] = useState(false);
  const [nearbyPots, setNearbyPots] = useState<NearbyPot[]>([]);
  const [selectedPot, setSelectedPot] = useState<NearbyPot | null>(null);
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");

  // -----------------------
  // SCANNING
  // -----------------------
  const startScan = async () => {
    setIsScanning(true);
    setNearbyPots([]);

    const stopScan = await scanForPots((device: any) => {
      const name =
        device.name ??
        device.localName ??
        "";

      if (!name.startsWith("BloomPot-")) return;

      setNearbyPots((prev) => {
        if (prev.find((x) => x.id === device.id)) return prev;

        return [
          ...prev,
          {
            id: device.id,
            name,
            macAddress: device.id,
            plant_id: 1,
          },
        ];
      });
    });

    setTimeout(() => {
      stopScan();
      setIsScanning(false);
    }, 5000);
  };

  // -----------------------
  // SAVE LOCAL PLANT
  // -----------------------
  const savePlant = () => {
    if (!selectedPot) return;

    addPlant({
      name: name.trim(),
      species: species.trim(),
      image:
        imageUrl.trim() ||
        "https://images.pexels.com/photos/3076899/pexels-photo-3076899.jpeg",
      supabasePlantId: selectedPot.plant_id,
      potMacAddress: selectedPot.macAddress,
      vitals: {
        temp: 24,
        moisture: 45,
        light: 900,
        humidity: 50,
      },
    });

    navigation.goBack();
  };

  // -----------------------
  // FINAL SAVE + WIFI PROVISIONING
  // -----------------------
  const onSave = async () => {
    if (!name.trim() || !species.trim()) {
      Alert.alert("Missing info", "Please enter a name and species.");
      return;
    }

    if (!selectedPot) {
      Alert.alert("Select Pot", "Please choose a Bloom Pot to link.");
      return;
    }

    if (!wifiSsid.trim()) {
      Alert.alert("WiFi Needed", "Enter your WiFi network name.");
      return;
    }

    const deviceId = selectedPot.id;

    try {
      console.log("🔗 Connecting to ESP32...");
      await connectToDevice(deviceId);

      // 1) Send WiFi SSID
      console.log("📡 Sending WiFi SSID:", wifiSsid);
      await writePassword(deviceId, SERVICE_UUID, SSID_CHAR_UUID, wifiSsid);

      // 2) Send WiFi password
      console.log("🔐 Sending WiFi password...");
      await writePassword(deviceId, SERVICE_UUID, PASS_CHAR_UUID, wifiPassword);

      // 3) Listen for status updates
      console.log("👂 Listening for connection status...");
      const unsub = await listenForResponse(
        deviceId,
        SERVICE_UUID,
        STATUS_CHAR_UUID,
        (status) => {
          console.log("📶 ESP32 Status:", status);

          if (status === "CONNECTED") {
            unsub.remove();
            Alert.alert("Success!", "ESP32 connected to WiFi and will start sending sensor data.");
            savePlant();
          } else if (status === "FAIL") {
            unsub.remove();
            Alert.alert("Connection Failed", "ESP32 couldn't connect to WiFi. Check credentials.");
          }
        }
      );

      // 4) Trigger WiFi connection
      console.log("🚀 Triggering WiFi connection...");
      await writePassword(deviceId, SERVICE_UUID, CONNECT_CHAR_UUID, "CONNECT");

      // Timeout after 30 seconds
      setTimeout(() => {
        unsub.remove();
        Alert.alert("Timeout", "ESP32 didn't respond. Check if it's in provisioning mode.");
      }, 30000);

    } catch (err) {
      console.log("BLE ERROR:", err);
      Alert.alert("Bluetooth error", "Could not connect to Bloom Pot.");
    }
  };

  // -----------------------
  // UI
  // -----------------------
  return (
    <View style={s.container}>
      <Text style={s.title}>Add a new plant</Text>
      <Text style={s.subtitle}>Link this plant to a Bloom Pot.</Text>

      {/* BASIC INFO */}
      <TextInput
        style={s.input}
        placeholder="Plant name (e.g. Monstera)"
        placeholderTextColor={colors.textMuted}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={s.input}
        placeholder="Species (e.g. Monstera deliciosa)"
        placeholderTextColor={colors.textMuted}
        value={species}
        onChangeText={setSpecies}
      />

      <TextInput
        style={s.input}
        placeholder="Image URL (optional)"
        placeholderTextColor={colors.textMuted}
        value={imageUrl}
        onChangeText={setImageUrl}
      />

      {/* BLUETOOTH */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Link with a Bloom Pot</Text>

        <TouchableOpacity
          style={[s.scanButton, isScanning && { opacity: 0.6 }]}
          onPress={startScan}
          disabled={isScanning}
        >
          <Text style={s.scanButtonText}>
            {isScanning ? "Scanning…" : "Scan for pots"}
          </Text>
        </TouchableOpacity>

        {/* POT LIST */}
        {nearbyPots.length > 0 && (
          <FlatList
            data={nearbyPots}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  s.potRow,
                  selectedPot?.id === item.id && s.potRowSelected,
                ]}
                onPress={() => setSelectedPot(item)}
              >
                <Text style={s.potName}>{item.name}</Text>
                <Text style={s.potMac}>{item.macAddress}</Text>
              </TouchableOpacity>
            )}
          />
        )}

        {selectedPot && (
          <>
            <Text style={s.label}>WiFi Network Name (SSID)</Text>
            <TextInput
              style={s.input}
              placeholder="Your WiFi name"
              placeholderTextColor={colors.textMuted}
              value={wifiSsid}
              onChangeText={setWifiSsid}
              autoCapitalize="none"
            />

            <Text style={s.label}>WiFi Password</Text>
            <TextInput
              style={s.input}
              placeholder="WiFi password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              value={wifiPassword}
              onChangeText={setWifiPassword}
              autoCapitalize="none"
            />

            <Text style={s.hint}>
              The ESP32 will connect to this WiFi network and start sending sensor data to the cloud.
            </Text>
          </>
        )}
      </View>

      {/* SAVE */}
      <TouchableOpacity style={s.button} onPress={onSave}>
        <Text style={s.buttonText}>Save Plant</Text>
      </TouchableOpacity>
    </View>
  );
}

// -----------------------
// STYLES
// -----------------------
const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: 40,
    paddingHorizontal: 18,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: fonts.sans,
    color: colors.textMuted,
    marginBottom: 18,
  },
  input: {
    backgroundColor: colors.panel,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: fonts.sans,
    color: colors.text,
    marginBottom: 12,
  },
  section: {
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panel,
  },
  sectionTitle: {
    fontFamily: fonts.sansSemi,
    color: colors.text,
    fontSize: 15,
    marginBottom: 8,
  },
  scanButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 10,
  },
  scanButtonText: {
    fontFamily: fonts.sansSemi,
    color: "#fff",
    fontSize: 14,
  },
  potRow: {
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    marginBottom: 8,
  },
  potRowSelected: {
    borderColor: colors.primary,
    backgroundColor: "#172019",
  },
  potName: {
    fontFamily: fonts.sansSemi,
    color: colors.text,
    fontSize: 15,
  },
  potMac: {
    fontFamily: fonts.sans,
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 3,
  },
  label: {
    fontFamily: fonts.sansSemi,
    color: colors.text,
    marginTop: 10,
  },
  hint: {
    fontFamily: fonts.sans,
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 8,
    lineHeight: 16,
  },
  button: {
    marginTop: 16,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontFamily: fonts.sansSemi,
    fontSize: 16,
  },
});
