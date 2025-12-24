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

import { fonts } from "../theme/typography";
import { themes } from "../theme/colors";
import { useThemeMode } from "../context/ThemeContext";

const HomeScreen: React.FC = ({ navigation }: any) => {
  const { mode } = useThemeMode();
  const colors = themes[mode];

  const { plants } = usePlants();
  const activePlant = plants && plants.length > 0 ? plants[0] : null;

  useRealtimeReadings(activePlant?.supabasePlantId ?? null);

  const reading = useReadingsStore((s) => s.reading);
  const error = useReadingsStore((s) => s.error);
  const setReading = useReadingsStore((s) => s.setReading);

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const latest = await fetchLatestReading(
        activePlant?.supabasePlantId
      );
      if (latest) setReading(latest);
    } catch (err) {
      console.error(err);
    }
    setRefreshing(false);
  }, [setReading, activePlant]);

  if (!activePlant) {
    return (
      <View
        style={[
          s.centered,
          { backgroundColor: colors.bg },
        ]}
      >
        <Text style={[s.emptyText, { color: colors.text }]}>
          No plants added yet
        </Text>

        <TouchableOpacity
          style={[
            s.addButton,
            { backgroundColor: colors.primary + "CC" },
          ]}
          onPress={() => navigation.navigate("AddPlant")}
        >
          <Text style={s.addButtonText}>
            Add your first plant
          </Text>
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

  const lastUpdated = reading?.created_at
    ? new Date(reading.created_at).toLocaleTimeString()
    : "Just now";

  const stateLabel =
    flowerState === 3
      ? "Happy"
      : flowerState === 2
      ? "Okay"
      : flowerState === 1
      ? "Needs water"
      : "Stressed";

  return (
    <View style={[s.container, { backgroundColor: colors.bg }]}>
      {/* HEADER */}
      <View style={s.header}>
        <View>
          <Text style={[s.appTitle, { color: colors.text }]}>
            Bloom
          </Text>
          <Text
            style={[
              s.subtitle,
              { color: colors.textMuted },
            ]}
          >
            Smart Plant Care
          </Text>
        </View>

        <View
          style={[
            s.avatar,
            { backgroundColor: colors.card },
          ]}
        >
          <Ionicons
            name="leaf"
            size={20}
            color={colors.primary}
          />
        </View>
      </View>

      {/* PLANT CARD */}
      <View
        style={[
          s.potCard,
          { backgroundColor: colors.card },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={[
              s.potTitle,
              { color: colors.text },
            ]}
          >
            {activePlant.name}
          </Text>

          <Text
            style={[
              s.potSubtitle,
              { color: colors.textMuted },
            ]}
          >
            {activePlant.species}
          </Text>

          <View style={s.chipRow}>
            <View
              style={[
                s.stateChip,
                { backgroundColor: colors.panel },
              ]}
            >
              <View
                style={[
                  s.stateDot,
                  { backgroundColor: colors.primary },
                ]}
              />
              <Text
                style={[
                  s.stateText,
                  { color: colors.primary },
                ]}
              >
                {stateLabel}
              </Text>
            </View>

            <Text
              style={[
                s.updatedText,
                { color: colors.textMuted },
              ]}
            >
              Updated {lastUpdated}
            </Text>
          </View>
        </View>

        <View
          style={[
            s.imageWrapper,
            { backgroundColor: colors.panel },
          ]}
        >
          <Image
            source={{ uri: activePlant.image }}
            style={s.plantImage}
            resizeMode="cover"
          />
        </View>
      </View>

      {error && (
        <View
          style={[
            s.errorCard,
            { backgroundColor: colors.panel },
          ]}
        >
          <Ionicons
            name="warning"
            size={20}
            color="#EF4444"
          />
          <Text
            style={[
              s.errorText,
              { color: "#EF4444" },
            ]}
          >
            {error}
          </Text>
        </View>
      )}

      <ScrollView
        style={s.scroll}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <Text
          style={[
            s.sectionTitle,
            { color: colors.text },
          ]}
        >
          Live Vitals
        </Text>

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

/* ================= STYLES ================= */

const s = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 60,
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  appTitle: {
    fontFamily: fonts.display,
    fontSize: 28,
  },

  subtitle: {
    fontFamily: fonts.sans,
    fontSize: 13,
    marginTop: 2,
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },

  potCard: {
    borderRadius: 22,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },

  potTitle: {
    fontFamily: fonts.sansSemi,
    fontSize: 20,
  },

  potSubtitle: {
    fontFamily: fonts.sans,
    fontSize: 13,
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginRight: 8,
  },

  stateDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    marginRight: 6,
  },

  stateText: {
    fontSize: 12,
    fontFamily: fonts.sansSemi,
  },

  updatedText: {
    fontSize: 12,
  },

  imageWrapper: {
    width: 70,
    height: 70,
    borderRadius: 20,
    overflow: "hidden",
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
    fontFamily: fonts.sansSemi,
    fontSize: 16,
    marginBottom: 12,
  },

  emptyText: {
    fontFamily: fonts.sans,
    fontSize: 16,
    marginBottom: 14,
  },

  addButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 18,
  },

  addButtonText: {
    color: "#fff",
    fontFamily: fonts.sansSemi,
  },

  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },

  errorText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
});

export default HomeScreen;
