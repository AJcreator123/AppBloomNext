// src/screens/HomeScreen.tsx
import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import StatusCard from "../components/StatusCard";
import { useRealtimeReadings } from "../hooks/useRealtimeReadings";
import { useReadingsStore } from "../store/readingsStore";
import { fetchLatestReading } from "../api/pots";

import { usePlants } from "../context/PlantsContext";   // ← IMPORTANT!!!

const HomeScreen: React.FC = ({ navigation }: any) => {
  // Load plants from context
  const { plants } = usePlants();

  // If no plants → show empty screen
  const activePlant = plants.length > 0 ? plants[0] : null;

  // Real-time Supabase readings
  useRealtimeReadings();
  const reading = useReadingsStore((s) => s.reading);
  const error = useReadingsStore((s) => s.error);
  const setReading = useReadingsStore((s) => s.setReading);

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const latest = await fetchLatestReading();
      if (latest) setReading(latest);
    } catch (err) {
      console.error("Refresh error:", err);
    }
    setRefreshing(false);
  }, [setReading]);

  if (!activePlant) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No plants added yet</Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddPlant")}
        >
          <Text style={styles.addButtonText}>Add your first plant</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const temperature = reading?.temperature ?? activePlant.vitals.temp;
  const humidity = reading?.humidity ?? activePlant.vitals.humidity;
  const moisture = reading?.moisture ?? activePlant.vitals.moisture;
  const light = reading?.light ?? activePlant.vitals.light;
  const flowerState = reading?.flower_state ?? 2;

  const lastUpdated =
    reading?.created_at != null
      ? new Date(reading.created_at).toLocaleTimeString()
      : "Just now";

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>Bloom</Text>
          <Text style={styles.subtitle}>Smart Plant Care</Text>
        </View>
        <View style={styles.avatar}>
          <Ionicons name="leaf" size={20} color="#22C55E" />
        </View>
      </View>

      {/* ACTIVE PLANT CARD */}
      <View style={styles.potCard}>
        <View>
          <Text style={styles.potTitle}>{activePlant.name}</Text>
          <Text style={styles.potSubtitle}>{activePlant.species}</Text>

          <View style={styles.chipRow}>
            <View style={styles.stateChip}>
              <View style={styles.stateDot} />
              <Text style={styles.stateText}>
                {flowerState === 3
                  ? "Happy"
                  : flowerState === 2
                  ? "Okay"
                  : flowerState === 1
                  ? "Needs water"
                  : "Stressed"}
              </Text>
            </View>

            <Text style={styles.updatedText}>Updated {lastUpdated}</Text>
          </View>
        </View>

        <View style={styles.potEmojiBadge}>
          <Text style={styles.potEmoji}>
            {flowerState === 3
              ? "🪴"
              : flowerState === 2
              ? "🌿"
              : flowerState === 1
              ? "🥀"
              : "⚠️"}
          </Text>
        </View>
      </View>

      {/* ERRORS */}
      {error && (
        <View style={styles.errorCard}>
          <Ionicons name="warning" size={20} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* LIVE VITALS */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.sectionTitle}>Live Vitals</Text>

        <StatusCard
          label="Temperature"
          value={temperature.toFixed(1)}
          unit="°C"
          status={
            temperature >= 18 && temperature <= 28
              ? "optimal"
              : temperature < 15
              ? "critical"
              : "warning"
          }
          iconName="thermometer-outline"
          helperText="Most tropical houseplants love 18–28°C."
        />

        <StatusCard
          label="Humidity"
          value={humidity.toFixed(0)}
          unit="%"
          status={
            humidity >= 50 && humidity <= 70
              ? "optimal"
              : humidity < 35
              ? "warning"
              : "info"
          }
          iconName="water-outline"
          helperText="Monstera prefers 50–70% humidity."
        />

        <StatusCard
          label="Soil Moisture"
          value={moisture.toFixed(0)}
          unit="%"
          status={
            moisture >= 60 && moisture <= 80
              ? "optimal"
              : moisture < 35
              ? "warning"
              : "info"
          }
          iconName="beaker-outline"
          helperText="Water when moisture drops below ~40–50%."
        />

        <StatusCard
          label="Light Level"
          value={light.toFixed(0)}
          unit="lux"
          status={
            light >= 500 && light <= 2000
              ? "optimal"
              : light < 200
              ? "warning"
              : "info"
          }
          iconName="sunny-outline"
          helperText="Bright, indirect light keeps Monstera happiest."
        />
      </ScrollView>
    </View>
  );
};

// --------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F7",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: "#22C55E",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 18,
  },
  addButtonText: {
    color: "white",
    fontWeight: "700",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#020617",
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: "#ECFDF3",
    justifyContent: "center",
    alignItems: "center",
  },
  potCard: {
    backgroundColor: "#111827",
    borderRadius: 22,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  potTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#F9FAFB",
  },
  potSubtitle: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 2,
  },
  chipRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  stateChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#022C22",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginRight: 8,
  },
  stateDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#22C55E",
    marginRight: 6,
  },
  stateText: {
    fontSize: 12,
    color: "#A7F3D0",
    fontWeight: "600",
  },
  updatedText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  potEmojiBadge: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#1F2937",
    justifyContent: "center",
    alignItems: "center",
  },
  potEmoji: {
    fontSize: 30,
  },
  scroll: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#020617",
    marginBottom: 12,
  },
  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: "#DC2626",
    marginLeft: 8,
    flex: 1,
  },
});

export default HomeScreen;
