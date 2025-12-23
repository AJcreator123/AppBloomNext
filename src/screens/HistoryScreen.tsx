import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";

import colors from "../theme/colors";
import { fonts } from "../theme/typography";
import { usePlants } from "../context/PlantsContext";

const SCREEN_WIDTH = Dimensions.get("window").width - 32;

function generateFakeData(days: number, min: number, max: number) {
  const labels = [];
  const data = [];
  const step = Math.max(1, Math.floor(days / 7));

  for (let i = 0; i < days; i++) {
    if (i % step === 0) labels.push(`Day ${i + 1}`);
    else labels.push("");
    data.push(Math.floor(min + Math.random() * (max - min)));
  }

  return { labels, data };
}

export default function HistoryScreen({ route, navigation }: any) {
  const { plantId } = route.params;
  const { plants } = usePlants();
  const plant = plants.find((p) => p.id === plantId);

  const [range, setRange] = useState<"week" | "month" | "year">("week");

  if (!plant) {
    return (
      <View style={s.center}>
        <Text style={s.error}>Plant not found</Text>
      </View>
    );
  }

  const ranges = { week: 7, month: 30, year: 365 };
  const days = ranges[range];

  const moisture = generateFakeData(days, 30, 80);
  const temperature = generateFakeData(days, 18, 30);
  const humidity = generateFakeData(days, 20, 70);
  const light = generateFakeData(days, 200, 2000);

  const chartConfig = {
    backgroundColor: colors.card,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 200, 120, ${opacity})`,
    labelColor: () => colors.textMuted,
    propsForDots: { r: "3", strokeWidth: "2", stroke: colors.primary },
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={s.backBtn}
      >
        <Ionicons name="chevron-back" size={30} color={colors.text} />
      </TouchableOpacity>

      <ScrollView
        style={s.container}
        contentContainerStyle={{
          paddingTop: 90,
          paddingBottom: 40,
        }}
      >
        <Text style={s.title}>{plant.name} — History</Text>

        <View style={s.rangeRow}>
          {["week", "month", "year"].map((r) => (
            <TouchableOpacity
              key={r}
              onPress={() => setRange(r as any)}
              style={[s.rangeBtn, range === r && s.rangeBtnActive]}
            >
              <Text
                style={[
                  s.rangeText,
                  range === r && { color: "white", fontFamily: fonts.sansSemi },
                ]}
              >
                {r === "week" ? "7 Days" : r === "month" ? "30 Days" : "1 Year"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.graphTitle}>Moisture (%)</Text>
        <LineChart
          data={{ labels: moisture.labels, datasets: [{ data: moisture.data }] }}
          width={SCREEN_WIDTH}
          height={220}
          chartConfig={chartConfig}
          style={s.chart}
        />

        <Text style={s.graphTitle}>Temperature (°C)</Text>
        <LineChart
          data={{ labels: temperature.labels, datasets: [{ data: temperature.data }] }}
          width={SCREEN_WIDTH}
          height={220}
          chartConfig={chartConfig}
          style={s.chart}
        />

        <Text style={s.graphTitle}>Humidity (%)</Text>
        <LineChart
          data={{ labels: humidity.labels, datasets: [{ data: humidity.data }] }}
          width={SCREEN_WIDTH}
          height={220}
          chartConfig={chartConfig}
          style={s.chart}
        />

        <Text style={s.graphTitle}>Light (lux)</Text>
        <LineChart
          data={{ labels: light.labels, datasets: [{ data: light.data }] }}
          width={SCREEN_WIDTH}
          height={220}
          chartConfig={chartConfig}
          style={s.chart}
        />

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 16,
  },
  title: {
    fontFamily: fonts.display,
    color: colors.text,
    fontSize: 28,
    marginBottom: 16,
  },
  graphTitle: {
    fontFamily: fonts.sansSemi,
    color: colors.text,
    fontSize: 16,
    marginTop: 26,
    marginBottom: 8,
  },
  chart: { borderRadius: 16 },

  backBtn: {
    position: "absolute",
    top: 40,
    left: 16,
    zIndex: 999,
    padding: 6,
    borderRadius: 100,
    backgroundColor: "rgba(0,0,0,0.18)",
  },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  error: {
    fontFamily: fonts.sansSemi,
    fontSize: 18,
    color: "red",
  },

  rangeRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },

  rangeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
  },
  rangeBtnActive: { backgroundColor: colors.primary },
  rangeText: {
    fontFamily: fonts.sans,
    color: colors.textMuted,
    fontSize: 14,
  },
});
