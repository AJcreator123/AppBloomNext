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
        <Text style={styles.errorTitle}>No plant found</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.errorButton}
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
        imageStyle={{ opacity: 0.85 }}
      >
        <View style={styles.headerOverlay} />

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.back}
        >
          <Ionicons name="chevron-back" size={30} color="white" />
        </TouchableOpacity>

        <View style={styles.titleBox}>
          <Text style={styles.titleText}>{plant.name}</Text>
          <Text style={styles.subText}>{plant.species}</Text>
        </View>
      </ImageBackground>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: 120,
          paddingHorizontal: 14,
        }}
      >

        <Text style={styles.vitalsHeader}>Plant Vitals</Text>

        {/* Moisture + Light */}
        <View style={styles.metricsRow}>
          <View style={styles.vitalWrapper}>
            <Text style={styles.vitalTitle}>Moisture</Text>
            <StatusCard
              value={v.moisture}
              unit="%"
              icon="water-outline"
              title=""
              tone={v.moisture < 40 ? "warn" : "ok"}
            />
          </View>

          <View style={styles.vitalWrapper}>
            <Text style={styles.vitalTitle}>Light</Text>
            <StatusCard
              value={v.light}
              unit="lux"
              icon="sunny-outline"
              title=""
            />
          </View>
        </View>

        {/* Temp + Humidity */}
        <View style={[styles.metricsRow, { marginTop: 16 }]}>
          <View style={styles.vitalWrapper}>
            <Text style={styles.vitalTitle}>Temperature</Text>
            <StatusCard
              value={v.temp}
              unit="°C"
              icon="thermometer-outline"
              title=""
            />
          </View>

          <View style={styles.vitalWrapper}>
            <Text style={styles.vitalTitle}>Humidity</Text>
            <StatusCard
              value={v.humidity}
              unit="%"
              icon="cloud-outline"
              title=""
            />
          </View>
        </View>

        {/* Recommendation */}
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
              <Text style={styles.row}>
                • Temperature: {advice.temperature}
              </Text>
            </>
          ) : (
            <Text style={styles.cardText}>No care profile found.</Text>
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

  header: {
    height: 300,
    justifyContent: "flex-end",
    alignItems: "center",
  },

  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.28)",
  },

  back: {
    position: "absolute",
    top: 52,
    left: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 100,
    padding: 8,
    zIndex: 50,
  },

  titleBox: {
    backgroundColor: "white",
    width: "85%",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 26,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },

  titleText: {
    fontFamily: fonts.display,
    color: colors.text,
    fontSize: 28,
  },

  subText: {
    fontFamily: fonts.sans,
    color: colors.textMuted,
    marginTop: 4,
    fontSize: 14,
  },

  vitalsHeader: {
    fontFamily: fonts.sansSemi,
    color: colors.text,
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
    color: colors.text,
    marginBottom: 6,
    marginLeft: 4,
  },

  card: {
    marginTop: 28,
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.line,
  },

  cardTitle: {
    fontFamily: fonts.sansSemi,
    color: colors.text,
    fontSize: 18,
    marginBottom: 8,
  },

  cardText: {
    fontFamily: fonts.sans,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 22,
  },

  row: {
    fontFamily: fonts.sans,
    color: colors.textMuted,
    marginTop: 8,
    lineHeight: 22 },
    
  historyButton: {
    marginTop: 28,
    alignSelf: "center",
    backgroundColor: colors.primary,
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
    backgroundColor: colors.bg,
  },

  errorTitle: {
    fontSize: 26,
    color: colors.text,
    fontFamily: fonts.display,
  },

  errorButton: {
    marginTop: 18,
    paddingHorizontal: 22,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 100,
  },

  errorButtonText: {
    color: "#fff",
    fontFamily: fonts.sansSemi,
  },
});
