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

export default function PlantDetailScreen({ route, navigation }: any) {
  const { plants } = usePlants();

  // Support BOTH styles:
  // 1) navigation.navigate('PlantDetail', { plant })
  // 2) navigation.navigate('PlantDetail', { plantId })
  const routePlant = route?.params?.plant;
  const routePlantId = route?.params?.plantId;

  let plant = routePlant ?? null;

  if (!plant && routePlantId != null) {
    const id = String(routePlantId);
    plant = plants.find((p) => String(p.id) === id) ?? null;
  }

  if (!plant) {
    // Debug view so we can SEE what’s coming through
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>No plant found 🥲</Text>
        <Text style={styles.errorText}>
          I couldn’t match a plant for this screen.
        </Text>
        <Text style={styles.errorTextSmall}>
          route.params = {JSON.stringify(route?.params || {}, null, 2)}
        </Text>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.errorButton}
        >
          <Text style={styles.errorButtonText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Safeguard vitals
  const vitals = plant.vitals || {
    temp: 0,
    moisture: 0,
    light: 0,
    humidity: 0,
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

        {/* Back button */}
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
        {/* METRICS ROW 1 */}
        <View style={styles.metricsRow}>
          <StatusCard
            title="Moisture"
            value={vitals.moisture}
            unit="%"
            icon="water-outline"
            tone={vitals.moisture < 40 ? "warn" : "ok"}
          />
          <StatusCard
            title="Light"
            value={vitals.light}
            unit="lux"
            icon="sunny-outline"
          />
        </View>

        {/* METRICS ROW 2 */}
        <View style={[styles.metricsRow, { marginTop: 12 }]}>
          <StatusCard
            title="Temperature"
            value={vitals.temp}
            unit="°C"
            icon="thermometer-outline"
          />
          <StatusCard
            title="Humidity"
            value={vitals.humidity ?? 0}
            unit="%"
            icon="cloud-outline"
          />
        </View>

        {/* CARE RECOMMENDATION */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Care Recommendation</Text>
          <Text style={styles.cardText}>
            {vitals.moisture < 40
              ? "Soil moisture looks low — water your plant thoroughly until some water drains out from the bottom of the pot."
              : "Your plant looks happy! Keep it in bright, indirect light and water when the top 2–3cm of soil feels dry."}
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

        {/* HISTORY BUTTON */}
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
  header: { height: 250, justifyContent: "flex-end" },
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
    letterSpacing: 0.5,
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

  // Error state UI
  errorContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorTitle: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.text,
    marginBottom: 8,
  },
  errorText: {
    fontFamily: fonts.sans,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: 8,
  },
  errorTextSmall: {
    fontFamily: fonts.sans,
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
  errorButton: {
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  errorButtonText: {
    color: "white",
    fontFamily: fonts.sansSemi,
    fontSize: 14,
  },
});
