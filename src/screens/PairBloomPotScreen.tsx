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
  Image,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

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
  const userSpecies = route.params?.speciesCommonName ?? "";
  const userImage = route.params?.imageUrl ?? "";

  const [isScanning, setIsScanning] = useState(false);
  const [pots, setPots] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");

  let stopScanFn: null | (() => void) = null;

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

  const onPair = async () => {
    if (!selected) return Alert.alert("Select Pot", "Choose a BloomPot first.");
    if (!wifiSsid.trim()) return Alert.alert("WiFi Required", "Enter your WiFi network.");

    try {
      const deviceId = selected.id;

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
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FlatList
        data={pots}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 120,
        }}
        ListHeaderComponent={
          <>

            {/* GREEN HEADER */}
            <View style={s.headerBackground}>

              {/* Step moved ABOVE heading */}
              <View style={s.stepCardTop}>
                <Text style={s.stepInline}>Step 2 of 2 • Pair Hardware</Text>
              </View>

              {/* Back Button */}
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={s.backButton}
              >
                <Ionicons name="chevron-back" size={30} color="white" />
              </TouchableOpacity>

              {/* Title */}
              <Text style={s.title}>Pair BloomPot</Text>

              <Text style={s.subtitle}>
                Connect this device to finish setup.
              </Text>

            </View>

            <View style={{ height: 26 }} />

            {/* Plant Card */}
            <View style={s.plantCard}>
              <Image
                source={{ uri: userImage }}
                style={s.plantImage}
              />

              <View style={{ marginLeft: 14 }}>
                <Text style={s.plantName}>{userName}</Text>
                <Text style={s.plantSpecies}>{userSpecies}</Text>
              </View>
            </View>

            <View style={{ height: 30 }} />

            {/* Scan Block */}
            <View style={s.scanBlock}>
              <Text style={s.blockTitle}>Nearby BloomPots</Text>

              <TouchableOpacity
                style={[s.scanBtn, isScanning && { opacity: 0.6 }]}
                onPress={startScan}
                disabled={isScanning}
              >
                <Ionicons name="radio-outline" size={20} color="white" />
                <Text style={s.scanBtnText}>
                  {isScanning ? "Scanning…" : "Scan for devices"}
                </Text>
              </TouchableOpacity>

              {pots.length === 0 && !isScanning && (
                <Text style={s.emptyMsg}>No devices found yet</Text>
              )}
            </View>

            <View style={{ height: 22 }} />

          </>
        }

        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelected(item)}
            style={[
              s.deviceTile,
              selected?.id === item.id && s.deviceTileSelected,
            ]}
          >
            <Ionicons
              name="cube-outline"
              size={24}
              color={selected?.id === item.id ? colors.primary : colors.text}
              style={{ marginRight: 10 }}
            />

            <View style={{ flex: 1 }}>
              <Text style={s.deviceName}>{item.name}</Text>
              <Text style={s.deviceMac}>{item.macAddress}</Text>
            </View>

            {selected?.id === item.id && (
              <Ionicons
                name="checkmark-circle-outline"
                size={26}
                color={colors.primary}
              />
            )}
          </TouchableOpacity>
        )}

        ListFooterComponent={
          selected && (
            <>
              <View style={{ height: 35 }} />

              <View style={s.scanBlock}>

                <Text style={s.blockTitle}>WiFi Credentials</Text>

                <Text style={s.label}>WiFi Name</Text>
                <TextInput
                  style={s.input}
                  value={wifiSsid}
                  onChangeText={setWifiSsid}
                  placeholder="Home WiFi network"
                  placeholderTextColor={colors.textMuted}
                />

                <Text style={s.label}>Password</Text>
                <TextInput
                  secureTextEntry
                  style={s.input}
                  value={wifiPassword}
                  onChangeText={setWifiPassword}
                  placeholder="Password"
                  placeholderTextColor={colors.textMuted}
                />

                <TouchableOpacity style={s.pairBtn} onPress={onPair}>
                  <Text style={s.pairBtnText}>Pair & Save Plant</Text>
                </TouchableOpacity>

              </View>

              <View style={{ height: 80 }} />
            </>
          )
        }
      />
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({

  headerBackground: {
    backgroundColor: colors.primary,
    paddingTop: 85,
    paddingBottom: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingHorizontal: 18,
  },

  backButton: {
    position: "absolute",
    top: 46,
    left: 18,
  },

  /* Step indicator moved above title */
  stepCardTop: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    marginBottom: 22,
    marginTop: 6,
  },

  stepInline: {
    color: "white",
    fontFamily: fonts.sansSemi,
    fontSize: 14,
  },

  title: {
    fontFamily: fonts.display,
    color: "white",
    fontSize: 30,
  },

  subtitle: {
    fontFamily: fonts.sans,
    color: "rgba(255,255,255,0.85)",
    marginTop: 6,
  },

  /* Plant card */
  plantCard: {
    backgroundColor: colors.card,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: "row",
    alignItems: "center",
  },

  plantImage: {
    width: 54,
    height: 54,
    borderRadius: 15,
    backgroundColor: "#0e0e0e",
  },

  plantName: {
    fontFamily: fonts.sansSemi,
    color: colors.text,
    fontSize: 18,
  },

  plantSpecies: {
    fontFamily: fonts.sans,
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },

  /* Scan section */
  scanBlock: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
  },

  blockTitle: {
    fontFamily: fonts.sansSemi,
    fontSize: 18,
    color: colors.text,
    marginBottom: 16,
  },

  scanBtn: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 28,
    paddingVertical: 14,
    marginBottom: 14,
  },

  scanBtnText: {
    color: "white",
    fontFamily: fonts.sansSemi,
    fontSize: 16,
    marginLeft: 8,
  },

  emptyMsg: {
    textAlign: "center",
    color: colors.textMuted,
    fontFamily: fonts.sans,
    fontSize: 13,
  },

  /* Devices list */
  deviceTile: {
    backgroundColor: colors.card,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  deviceTileSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },

  deviceName: {
    fontFamily: fonts.sansSemi,
    fontSize: 16,
    color: colors.text,
  },

  deviceMac: {
    marginTop: 3,
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textMuted,
  },

  /* WiFi form */
  label: {
    fontFamily: fonts.sansSemi,
    fontSize: 15,
    color: colors.text,
    marginTop: 14,
  },

  input: {
    backgroundColor: colors.panel,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    fontFamily: fonts.sans,
    marginTop: 8,
  },

  pairBtn: {
    marginTop: 26,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 26,
    alignItems: "center",
  },

  pairBtnText: {
    color: "white",
    fontFamily: fonts.sansSemi,
    fontSize: 17,
  },
});
