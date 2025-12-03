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

  // ⭐ Subscribe to realtime readings for this plant
  useRealtimeReadings(plant.supabasePlantId);

  const reading = useReadingsStore((s) => s.reading);

  // fallback vitals
  const v = {
    temp: reading?.temperature ?? plant.vitals.temp,
    moisture: reading?.moisture ?? plant.vitals.moisture,
    light: reading?.light ?? plant.vitals.light,
    humidity: reading?.humidity ?? plant.vitals.humidity,
  };

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

        {/* CARE CARD */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Care Recommendation</Text>
          <Text style={styles.cardText}>
            {v.moisture < 40
              ? "Soil moisture is low — water your plant well."
              : "Your plant looks healthy! Keep it in bright, indirect light."}
          </Text>
        </View>

        {/* OPTIMAL CONDITIONS */}
        <View style={[styles.card, { marginTop: 12 }]}>
          <Text style={styles.cardTitle}>Optimal Conditions</Text>
          <Text style={styles.row}>• Moisture: 50–70%</Text>
          <Text style={styles.row}>• Light: 500–2000 lux</Text>
          <Text style={styles.row}>• Temperature: 18–24°C</Text>
          <Text style={styles.row}>• Humidity: 40–60%</Text>
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
  errorText: {
    marginTop: 8,
    color: colors.textMuted,
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
