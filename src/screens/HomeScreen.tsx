// src/screens/HomeScreen.tsx
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import StatusCard from "../components/StatusCard";
import { useLiveReadings } from "../hooks/useLiveReadings";
import { useReadingsStore } from "../store/readingsStore";
import { fetchLatestReading } from "../api/pots";

const HomeScreen: React.FC = () => {
  // start polling Supabase every few seconds
  useLiveReadings(5000);

  const reading = useReadingsStore((s) => s.reading);
  const setReading = useReadingsStore((s) => s.setReading);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const latest = await fetchLatestReading();
    if (latest) setReading(latest);
    setRefreshing(false);
  }, [setReading]);

  const temperature = reading?.temperature ?? 24.5;
  const humidity = reading?.humidity ?? 45;
  const moisture = reading?.moisture ?? 55;
  const light = reading?.light ?? 800;
  const flowerState = reading?.flower_state ?? 2;

  const lastUpdated =
    reading?.created_at != null
      ? new Date(reading.created_at).toLocaleTimeString()
      : "Just now";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>Bloom</Text>
          <Text style={styles.subtitle}>Smart Plant Care</Text>
        </View>
        <View style={styles.avatar}>
          <Ionicons name="leaf" size={20} color="#22C55E" />
        </View>
      </View>

      <View style={styles.potCard}>
        <View>
          <Text style={styles.potTitle}>My Monstera</Text>
          <Text style={styles.potSubtitle}>Monstera Deliciosa</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F7",
    paddingHorizontal: 16,
    paddingTop: 16,
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
});

export default HomeScreen;
