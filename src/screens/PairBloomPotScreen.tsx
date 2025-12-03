// src/screens/PairBloomPotScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
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
  STATUS_CHAR_UUID,
} from "../ble/uuids";

export default function PairBloomPotScreen({ navigation, route }: any) {
  const { addPlant } = usePlants();

  const userName = route.params?.name ?? "";
  const userSpecies = route.params?.species ?? "";
  const userImage = route.params?.imageUrl ?? "";

  const [isScanning, setIsScanning] = useState(false);
  const [pots, setPots] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");

  let stopScanFn: null | (() => void) = null;

  // -------------------------------
  // SCAN
  // -------------------------------
  const startScan = async () => {
    setIsScanning(true);
    setPots([]);

    stopScanFn = await scanForPots((device) => {
      const name = device.name || device.localName || "";
      if (!name.startsWith("BloomPot-")) return;

      setPots((prev) => {
        if (prev.find((p) => p.id === device.id)) return prev;
        return [...prev, { id: device.id, name, macAddress: device.id, plant_id: 1 }];
      });
    });

    setTimeout(() => {
      stopScanFn?.();
      setIsScanning(false);
    }, 6000);
  };

  // -------------------------------
  // SAVE PLANT
  // -------------------------------
  const savePlant = () => {
    const newPlant = {
      name: userName.trim(),
      species: userSpecies.trim(),
      image:
        userImage.trim() ||
        "https://images.pexels.com/photos/3076899/pexels-photo-3076899.jpeg",
      supabasePlantId: selected.plant_id,
      potMacAddress: selected.macAddress,
      vitals: { temp: 24, humidity: 50, moisture: 40, light: 900 },
    };

    addPlant(newPlant);

    navigation.reset({
      index: 0,
      routes: [{ name: "Root" }],
    });
  };

  // -------------------------------
  // PAIR ACTION
  // -------------------------------
  const onPair = async () => {
    if (!selected) return Alert.alert("Select Pot", "Choose a BloomPot first.");
    if (!wifiSsid.trim()) return Alert.alert("WiFi Required", "Enter your WiFi network name.");

    const deviceId = selected.id;

    try {
      const device = await connectToDevice(deviceId);

      await writePassword(deviceId, SERVICE_UUID, SSID_CHAR_UUID, wifiSsid);
      await writePassword(deviceId, SERVICE_UUID, PASS_CHAR_UUID, wifiPassword);

      listenForResponse(deviceId, SERVICE_UUID, STATUS_CHAR_UUID, (status) => {
        if (status === "CONNECTED") {
          Alert.alert("Success", "BloomPot connected!");
          savePlant();
        }
      });

      await writePassword(deviceId, SERVICE_UUID, CONNECT_CHAR_UUID, "CONNECT");
    } catch (err) {
      Alert.alert("BLE Error", String(err));
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FlatList
        data={pots}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 40,   // ⭐⭐⭐ HEADER MOVED DOWN — FIX
          paddingBottom: 30,
        }}
        ListHeaderComponent={
          <>
            <Text style={s.title}>Pair Bloom Pot</Text>
            <Text style={s.subtitle}>
              Your Plant: {userName} ({userSpecies})
            </Text>

            <TouchableOpacity
              style={[s.scanButton, isScanning && { opacity: 0.5 }]}
              onPress={startScan}
              disabled={isScanning}
            >
              <Text style={s.scanButtonText}>
                {isScanning ? "Scanning…" : "Scan for BloomPots"}
              </Text>
            </TouchableOpacity>
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelected(item)}
            style={[
              s.potRow,
              selected?.id === item.id && s.potSelected,
            ]}
          >
            <Text style={s.potName}>{item.name}</Text>
            <Text style={s.potMac}>{item.macAddress}</Text>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          selected && (
            <View style={{ marginTop: 20 }}>
              <Text style={s.label}>WiFi Name (SSID)</Text>
              <TextInput
                style={s.input}
                value={wifiSsid}
                onChangeText={setWifiSsid}
                placeholder="Your WiFi"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={s.label}>WiFi Password</Text>
              <TextInput
                style={s.input}
                value={wifiPassword}
                secureTextEntry
                onChangeText={setWifiPassword}
                placeholder="Password"
                placeholderTextColor={colors.textMuted}
              />

              <TouchableOpacity style={s.button} onPress={onPair}>
                <Text style={s.buttonText}>Pair & Save Plant</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  title: {
    fontSize: 26,
    fontFamily: fonts.display,
    color: colors.text,
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 20,
    fontSize: 14,
    color: colors.textMuted,
  },
  scanButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 14,
  },
  scanButtonText: {
    color: "#fff",
    fontFamily: fonts.sansSemi,
  },
  potRow: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  potSelected: {
    backgroundColor: "#12271a",
    borderColor: colors.primary,
  },
  potName: {
    color: colors.text,
    fontFamily: fonts.sansSemi,
    fontSize: 16,
  },
  potMac: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 3,
  },
  label: {
    marginTop: 12,
    fontFamily: fonts.sansSemi,
    color: colors.text,
  },
  input: {
    marginTop: 6,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    borderRadius: 12,
    color: colors.text,
  },
  button: {
    marginTop: 24,
    marginBottom: 40,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontFamily: fonts.sansSemi,
    fontSize: 16,
  },
});
