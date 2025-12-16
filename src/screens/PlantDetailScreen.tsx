// src/screens/PlantDetailScreen.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import colors from "../theme/colors";
import { fonts } from "../theme/typography";
import StatusCard from "../components/StatusCard";

import { usePlants } from "../context/PlantsContext";
import { useRealtimeReadings } from "../hooks/useRealtimeReadings";
import { useReadingsStore } from "../store/readingsStore";

// ✅ Bloom imports
import {
  bloompotStep,
  createInitialBloompotState,
} from "../engine/bloomModel";
import {
  findPlantProfileByCommonName,
  PlantProfile,
} from "../engine/plantProfiles";

export default function PlantDetailScreen({ route, navigation }: any) {
  const { plants } = usePlants();

  const routePlant = route?.params?.plant;
  const routePlantId = route?.params?.plantId;

  let plant = routePlant ?? null;

  if (!plant && routePlantId != null) {
    const id = String(routePlantId);
    plant = plants.find((p) => String(p.id) === id) ?? null;
  }

  if (!plant) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>No plant found 🥲</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.errorButton}
        >
          <Text style={styles.errorButtonText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 🔁 Subscribe to realtime readings for this plant
  useRealtimeReadings(plant.supabasePlantId);
  const reading = useReadingsStore((s) => s.reading);

  // Normalize vitals (realtime or fallback)
  const v = {
    temp: reading?.temperature ?? plant.vitals.temp,
    moisture: reading?.moisture ?? plant.vitals.moisture,
    light: reading?.light ?? plant.vitals.light,
    humidity: reading?.humidity ?? plant.vitals.humidity,
  };

  // 🌱 Lookup plant profile from database
  const profile: PlantProfile | undefined =
    findPlantProfileByCommonName(plant.species);

  // 🌿 Run Bloom model (only if profile exists)
  const modelOutput = profile
    ? bloompotStep(
        {
          ...createInitialBloompotState(profile),
          W: v.moisture / 100, // convert % → 0–1
        },
        {
          temperatureC: v.temp,
          humidityPct: v.humidity,
          lightLux: v.light,
          dtHours: 0.1,
        },
        profile
      )
    : null;

  const advice = modelOutput?.advice;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* HEADER IMAGE */}
      <ImageBackground
        source={{ uri: plant.image }}
        style={styles.header}
        imageStyle={{ opacity: 0.9 }}
      >
        <View style={styles.headerOverlay} />

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.back}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={styles.title}>{plant.name}</Text>
          <Text style={styles.sub}>{plant.species}</Text>
        </View>
      </ImageBackground>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* METRIC ROW 1 */}
        <View style={styles.metricsRow}>
          <StatusCard
            title="Moisture"
            value={v.moisture}
            unit="%"
            icon="water-outline"
            tone={v.moisture < 40 ? "warn" : "ok"}
          />
          <StatusCard
            title="Light"
            value={v.light}
            unit="lux"
            icon="sunny-outline"
          />
        </View>

        {/* METRIC ROW 2 */}
        <View style={[styles.metricsRow, { marginTop: 12 }]}>
          <StatusCard
            title="Temperature"
            value={v.temp}
            unit="°C"
            icon="thermometer-outline"
          />
          <StatusCard
            title="Humidity"
            value={v.humidity}
            unit="%"
            icon="cloud-outline"
          />
        </View>

        {/* 🌿 MODEL-DRIVEN CARE CARD */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Care Recommendation</Text>

          {advice ? (
            <>
              <Text style={styles.cardText}>
                <Text style={{ fontFamily: fonts.sansSemi }}>Overall: </Text>
                {advice.overall}
              </Text>

              <Text style={styles.row}>• Water: {advice.water}</Text>
              <Text style={styles.row}>• Light: {advice.light}</Text>
              <Text style={styles.row}>• Temperature: {advice.temperature}</Text>
            </>
          ) : (
            <Text style={styles.cardText}>
              No care profile found for this plant.
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.historyButton}
          onPress={() =>
            navigation.navigate("History", {
              plantId: String(plant.id),
              plantName: plant.name,
            })
          }
        >
          <Text style={styles.historyText}>View Full History</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { height: 260, justifyContent: "flex-end" },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  back: {
    position: "absolute",
    top: 46,
    left: 16,
    backgroundColor: "rgba(0,0,0,0.28)",
    borderRadius: 999,
    padding: 6,
  },
  headerText: { padding: 20 },
  title: {
    fontFamily: fonts.display,
    color: colors.text,
    fontSize: 30,
  },
  sub: {
    fontFamily: fonts.sans,
    color: colors.textMuted,
    marginTop: 4,
  },
  metricsRow: {
    flexDirection: "row",
    paddingHorizontal: 18,
    marginTop: 14,
    justifyContent: "space-between",
  },
  card: {
    marginTop: 16,
    marginHorizontal: 18,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
  },
  cardTitle: {
    fontFamily: fonts.sansSemi,
    color: colors.text,
    fontSize: 16,
    marginBottom: 8,
  },
  cardText: {
    fontFamily: fonts.sans,
    color: colors.textMuted,
    lineHeight: 20,
  },
  row: {
    fontFamily: fonts.sans,
    color: colors.textMuted,
    marginTop: 6,
  },
  historyButton: {
    marginTop: 20,
    alignSelf: "center",
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  historyText: {
    color: "white",
    fontFamily: fonts.sansSemi,
    fontSize: 16,
  },

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.bg,
  },
  errorTitle: {
    fontSize: 24,
    color: colors.text,
    fontFamily: fonts.display,
  },
  errorButton: {
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 999,
  },
  errorButtonText: {
    color: "#fff",
    fontFamily: fonts.sansSemi,
  },
});
