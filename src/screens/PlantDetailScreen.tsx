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
import { fonts } from "../theme/typography";
import { themes } from "../theme/colors";
import { useThemeMode } from "../context/ThemeContext";

import StatusCard from "../components/StatusCard";
import { usePlants } from "../context/PlantsContext";
import { useRealtimeReadings } from "../hooks/useRealtimeReadings";
import { useReadingsStore } from "../store/readingsStore";

import {
  bloompotStep,
  createInitialBloompotState,
} from "../engine/bloomModel";
import {
  findPlantProfileByCommonName,
  PlantProfile,
} from "../engine/plantProfiles";

/* ================= ICON STYLES PER VITAL ================= */

const VITAL_ICON = {
  moisture: {
    icon: "water-outline",
    bg: "#2563EB22",
    color: "#2563EB",
  },
  light: {
    icon: "sunny-outline",
    bg: "#F59E0B22",
    color: "#F59E0B",
  },
  temp: {
    icon: "thermometer-outline",
    bg: "#EF444422",
    color: "#EF4444",
  },
  humidity: {
    icon: "cloud-outline",
    bg: "#06B6D422",
    color: "#06B6D4",
  },
};

export default function PlantDetailScreen({ route, navigation }: any) {
  const { mode } = useThemeMode();
  const colors = themes[mode];

  const { plants } = usePlants();

  const routePlant = route?.params?.plant;
  const routePlantId = route?.params?.plantId;

  let plant = routePlant ?? null;

  if (!plant && routePlantId != null) {
    plant =
      plants.find((p) => String(p.id) === String(routePlantId)) ?? null;
  }

  if (!plant) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.bg }]}>
        <Text style={[styles.errorTitle, { color: colors.text }]}>
          No plant found
        </Text>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[
            styles.errorButton,
            { backgroundColor: colors.primary + "CC" },
          ]}
        >
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  useRealtimeReadings(plant.supabasePlantId);
  const reading = useReadingsStore((s) => s.reading);

  const v = {
    temp: reading?.temperature ?? plant.vitals.temp,
    moisture: reading?.moisture ?? plant.vitals.moisture,
    light: reading?.light ?? plant.vitals.light,
    humidity: reading?.humidity ?? plant.vitals.humidity,
  };

  const profile: PlantProfile | undefined =
    findPlantProfileByCommonName(plant.species);

  const modelOutput = profile
    ? bloompotStep(
        {
          ...createInitialBloompotState(profile),
          W: v.moisture / 100,
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
      {/* HEADER */}
      <ImageBackground
        source={{ uri: plant.image }}
        style={styles.header}
        imageStyle={{ opacity: 0.9 }}
      >
        <View style={styles.headerOverlay} />

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[
            styles.back,
            { backgroundColor: "rgba(0,0,0,0.45)" },
          ]}
        >
          <Ionicons name="chevron-back" size={30} color="white" />
        </TouchableOpacity>

        <View
          style={[
            styles.titleBox,
            {
              backgroundColor: colors.card,
              borderColor: colors.line,
            },
          ]}
        >
          <Text style={[styles.titleText, { color: colors.text }]}>
            {plant.name}
          </Text>
          <Text style={[styles.subText, { color: colors.textMuted }]}>
            {plant.species}
          </Text>
        </View>
      </ImageBackground>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: 120,
          paddingHorizontal: 14,
        }}
      >
        <Text style={[styles.vitalsHeader, { color: colors.text }]}>
          Plant Vitals
        </Text>

        {/* Moisture + Light */}
        <View style={styles.metricsRow}>
          <View style={styles.vitalWrapper}>
            <Text style={[styles.vitalTitle, { color: colors.text }]}>
              Moisture
            </Text>
            <StatusCard
              value={v.moisture}
              unit="%"
              icon={VITAL_ICON.moisture.icon}
              iconColor={VITAL_ICON.moisture.color}
              iconBg={VITAL_ICON.moisture.bg}
              title=""
              tone={v.moisture < 40 ? "warn" : "ok"}
            />
          </View>

          <View style={styles.vitalWrapper}>
            <Text style={[styles.vitalTitle, { color: colors.text }]}>
              Light
            </Text>
            <StatusCard
              value={v.light}
              unit="lux"
              icon={VITAL_ICON.light.icon}
              iconColor={VITAL_ICON.light.color}
              iconBg={VITAL_ICON.light.bg}
              title=""
            />
          </View>
        </View>

        {/* Temp + Humidity */}
        <View style={[styles.metricsRow, { marginTop: 16 }]}>
          <View style={styles.vitalWrapper}>
            <Text style={[styles.vitalTitle, { color: colors.text }]}>
              Temperature
            </Text>
            <StatusCard
              value={v.temp}
              unit="°C"
              icon={VITAL_ICON.temp.icon}
              iconColor={VITAL_ICON.temp.color}
              iconBg={VITAL_ICON.temp.bg}
              title=""
            />
          </View>

          <View style={styles.vitalWrapper}>
            <Text style={[styles.vitalTitle, { color: colors.text }]}>
              Humidity
            </Text>
            <StatusCard
              value={v.humidity}
              unit="%"
              icon={VITAL_ICON.humidity.icon}
              iconColor={VITAL_ICON.humidity.color}
              iconBg={VITAL_ICON.humidity.bg}
              title=""
            />
          </View>
        </View>

        {/* Recommendation */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.line,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Care Recommendation
          </Text>

          {advice ? (
            <>
              <Text style={[styles.cardText, { color: colors.textMuted }]}>
                <Text style={{ fontFamily: fonts.sansSemi }}>Overall: </Text>
                {advice.overall}
              </Text>

              <Text style={[styles.row, { color: colors.textMuted }]}>
                • Water: {advice.water}
              </Text>
              <Text style={[styles.row, { color: colors.textMuted }]}>
                • Light: {advice.light}
              </Text>
              <Text style={[styles.row, { color: colors.textMuted }]}>
                • Temperature: {advice.temperature}
              </Text>
            </>
          ) : (
            <Text style={[styles.cardText, { color: colors.textMuted }]}>
              No care profile found.
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.historyButton,
            { backgroundColor: colors.primary + "CC" },
          ]}
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

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  header: {
    height: 300,
    justifyContent: "flex-end",
    alignItems: "center",
  },

  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },

  back: {
    position: "absolute",
    top: 52,
    left: 16,
    borderRadius: 100,
    padding: 8,
    zIndex: 50,
  },

  titleBox: {
    width: "85%",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 26,
    borderWidth: 1,
  },

  titleText: {
    fontFamily: fonts.display,
    fontSize: 28,
  },

  subText: {
    fontFamily: fonts.sans,
    marginTop: 4,
    fontSize: 14,
  },

  vitalsHeader: {
    fontFamily: fonts.sansSemi,
    fontSize: 18,
    marginTop: 28,
    marginBottom: 10,
  },

  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  vitalWrapper: {
    width: "48%",
  },

  vitalTitle: {
    fontFamily: fonts.sansSemi,
    fontSize: 14,
    marginBottom: 6,
    marginLeft: 4,
  },

  card: {
    marginTop: 28,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
  },

  cardTitle: {
    fontFamily: fonts.sansSemi,
    fontSize: 18,
    marginBottom: 8,
  },

  cardText: {
    fontFamily: fonts.sans,
    marginTop: 4,
    lineHeight: 22,
  },

  row: {
    fontFamily: fonts.sans,
    marginTop: 8,
    lineHeight: 22,
  },

  historyButton: {
    marginTop: 28,
    alignSelf: "center",
    paddingVertical: 14,
    paddingHorizontal: 26,
    borderRadius: 20,
  },

  historyText: {
    color: "white",
    fontFamily: fonts.sansSemi,
    fontSize: 17,
  },

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  errorTitle: {
    fontSize: 26,
    fontFamily: fonts.display,
  },

  errorButton: {
    marginTop: 18,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 100,
  },

  errorButtonText: {
    color: "#fff",
    fontFamily: fonts.sansSemi,
  },
});
