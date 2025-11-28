// src/screens/AddPlantScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";

import colors from "../theme/colors";
import { fonts } from "../theme/typography";
import { usePlants } from "../context/PlantsContext";

import {
  initBLE,
  scanForPots,
  connectToPot,
  writePassword,
  listenForPasswordResponse,
} from "../ble/BLE";

export default function AddPlantScreen({ navigation }: any) {
  const { addPlant } = usePlants();

  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);

  const [password, setPassword] = useState("");
  const [isAuthenticating, setAuthenticating] = useState(false);

  // form inputs
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");

  useEffect(() => {
    initBLE();
  }, []);

  // ============================================================
  // SCAN FOR DEVICES
  // ============================================================
  const startScan = async () => {
    setDevices([]);
    setScanning(true);

    try {
      const stopListener = await scanForPots((device) => {
        setDevices((prev) => {
          if (prev.find((d) => d.id === device.id)) return prev;
          return [...prev, device];
        });
      });

      // stop after 5 seconds
      setTimeout(() => {
        stopListener();
        setScanning(false);
      }, 5000);
    } catch (err: any) {
      Alert.alert("Scan Error", err.message);
      setScanning(false);
    }
  };

  // ============================================================
  // PAIR WITH PASSWORD
  // ============================================================
  const attemptPairing = async () => {
    if (!selectedDevice) {
      Alert.alert("No device selected", "Choose a Bloom Pot first.");
      return;
    }
    if (!password.trim()) {
      Alert.alert("Missing Password", "Enter the pot password.");
      return;
    }

    setAuthenticating(true);

    try {
      await connectToPot(selectedDevice.id);

      // listen for OK or FAIL
      const unsub = listenForPasswordResponse(selectedDevice.id, (text) => {
        console.log("ESP32 says:", text);

        if (text === "OK") {
          unsub();
          setAuthenticating(false);
          Alert.alert("Connected", "Password correct!");

          // now save the plant
          addPlant({
            name,
            species,
            image:
              "https://images.pexels.com/photos/3076899/pexels-photo-3076899.jpeg",
            vitals: {
              temp: 0,
              moisture: 0,
              light: 0,
              humidity: 0,
            },
          });

          navigation.goBack();
        }

        if (text === "FAIL") {
          unsub();
          setAuthenticating(false);
          Alert.alert("Wrong Password", "Try again.");
        }
      });

      await writePassword(selectedDevice.id, password);
    } catch (err: any) {
      console.log(err);
      setAuthenticating(false);
      Alert.alert("Connection error", err.message);
    }
  };

  // ============================================================
  return (
    <View style={s.container}>
      <Text style={s.title}>Add a new plant</Text>

      {/* Scan Button */}
      <TouchableOpacity style={s.scanButton} onPress={startScan}>
        <Text style={s.scanButtonText}>
          {scanning ? "Scanning…" : "Scan for Bloom Pots"}
        </Text>
      </TouchableOpacity>

      {scanning && <ActivityIndicator size="small" color={colors.primary} />}

      {/* List of devices */}
      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              s.deviceItem,
              selectedDevice?.id === item.id && s.deviceSelected,
            ]}
            onPress={() => setSelectedDevice(item)}
          >
            <Text style={s.deviceName}>{item.name}</Text>
            <Text style={s.deviceId}>{item.id}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Plant details */}
      <TextInput
        style={s.input}
        placeholder="Plant Name"
        placeholderTextColor={colors.textMuted}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={s.input}
        placeholder="Species"
        placeholderTextColor={colors.textMuted}
        value={species}
        onChangeText={setSpecies}
      />

      {/* Password */}
      <TextInput
        style={s.input}
        placeholder="Enter Pot Password"
        placeholderTextColor={colors.textMuted}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Pair */}
      <TouchableOpacity style={s.button} onPress={attemptPairing}>
        <Text style={s.buttonText}>
          {isAuthenticating ? "Connecting…" : "Pair & Save Plant"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ============================================================
// STYLING
// ============================================================

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
    marginBottom: 20,
  },
  scanButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 12,
  },
  scanButtonText: {
    color: "white",
    fontFamily: fonts.sansSemi,
    fontSize: 16,
  },
  deviceItem: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 8,
  },
  deviceSelected: {
    backgroundColor: colors.card,
    borderColor: colors.primary,
  },
  deviceName: {
    fontFamily: fonts.sansSemi,
    color: colors.text,
  },
  deviceId: {
    fontFamily: fonts.sans,
    color: colors.textMuted,
    fontSize: 12,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: fonts.sans,
    color: colors.text,
    marginTop: 12,
  },
  button: {
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: "center",
  },
  buttonText: {
    fontFamily: fonts.sansSemi,
    color: "white",
    fontSize: 16,
  },
});
