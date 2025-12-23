import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import StatusCard from "../components/StatusCard";
import { useRealtimeReadings } from "../hooks/useRealtimeReadings";
import { useReadingsStore } from "../store/readingsStore";
import { fetchLatestReading } from "../api/pots";
import { usePlants } from "../context/PlantsContext";

const HomeScreen: React.FC = ({ navigation }: any) => {
  const { plants } = usePlants();

  const activePlant =
    plants && plants.length > 0 ? plants[0] : null;

  useRealtimeReadings(activePlant?.supabasePlantId ?? null);

  const reading = useReadingsStore((s) => s.reading);
  const error = useReadingsStore((s) => s.error);
  const setReading = useReadingsStore((s) => s.setReading);

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const latest = await fetchLatestReading(activePlant?.supabasePlantId);
      if (latest) setReading(latest);
    } catch (err) {
      console.error(err);
    }
    setRefreshing(false);
  }, [setReading, activePlant]);

  if (!activePlant) {
    return (
      <View style={[styles.centered, { backgroundColor: "#0B0F12" }]}>
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

  const v = activePlant.vitals || {};

  const temperature = reading?.temperature ?? v.temp ?? 24;
  const humidity = reading?.humidity ?? v.humidity ?? 50;
  const moisture = reading?.moisture ?? v.moisture ?? 50;
  const light = reading?.light ?? v.light ?? 800;
  const flowerState = reading?.flower_state ?? 2;

  const lastUpdated =
    reading?.created_at
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
        <View style={{ flex: 1 }}>

          <Text style={styles.potTitle}>
            {activePlant.name}
          </Text>

          <Text style={styles.potSubtitle}>
            {activePlant.species}
          </Text>

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

            <Text style={styles.updatedText}>
              Updated {lastUpdated}
            </Text>

          </View>
        </View>

        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: activePlant.image }}
            style={styles.plantImage}
            resizeMode="cover"
          />
        </View>
      </View>

      {error && (
        <View style={styles.errorCard}>
          <Ionicons name="warning" size={20} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

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
          value={Number(temperature).toFixed(1)}
          unit="°C"
          iconName="thermometer-outline"
        />

        <StatusCard
          label="Humidity"
          value={Number(humidity).toFixed(0)}
          unit="%"
          iconName="water-outline"
        />

        <StatusCard
          label="Soil Moisture"
          value={Number(moisture).toFixed(0)}
          unit="%"
          iconName="beaker-outline"
        />

        <StatusCard
          label="Light Level"
          value={Number(light).toFixed(0)}
          unit="lux"
          iconName="sunny-outline"
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

    // FULL DARK BACKGROUND
    backgroundColor: "rgba(167, 49, 116, 1)",

    paddingHorizontal: 16,
    paddingTop: 60,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    marginBottom: 20,
  },

  appTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
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

    backgroundColor: "#122027",

    justifyContent: "center",
    alignItems: "center",
  },

  potCard: {
    backgroundColor: "#121820",
    borderRadius: 22,
    padding: 18,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    marginBottom: 22,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  potTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
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
    backgroundColor: "#163032",
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

  imageWrapper: {
    width: 70,
    height: 70,
    borderRadius: 20,

    overflow: "hidden",

    backgroundColor: "#121820",
    marginLeft: 14,
  },

  plantImage: {
    width: "100%",
    height: "100%",
  },

  scroll: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 12,
  },

  emptyText: {
    color: "#fff",
  },

  addButton: {
    backgroundColor: "#22C55E",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 18,
  },

  addButtonText: {
    color: "#000",
    fontWeight: "700",
  },

  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#442020",
    borderRadius: 8,
    padding: 12,
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
