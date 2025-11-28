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
import colors from "../theme/colors";
import { fonts } from "../theme/typography";
import { usePlants } from "../context/PlantsContext";

const SCREEN_WIDTH = Dimensions.get("window").width - 32;

// ---- Generate Fake Data ----
function generateFakeData(days: number, min: number, max: number) {
  const labels = [];
  const data = [];
  const step = Math.max(1, Math.floor(days / 7)); // show 7 labels max

  for (let i = 0; i < days; i++) {
    if (i % step === 0) labels.push(`Day ${i + 1}`);
    else labels.push("");
    data.push(Math.floor(min + Math.random() * (max - min)));
  }

  return { labels, data };
}

export default function HistoryScreen({ route }: any) {
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

  // ---- Fake dataset ranges ----
  const ranges = {
    week: 7,
    month: 30,
    year: 365,
  };

  const days = ranges[range];

  // Generate data for each sensor
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
    propsForDots: {
      r: "3",
      strokeWidth: "2",
      stroke: colors.primary,
    },
  };

  return (
    <ScrollView style={s.container}>
      {/* Title */}
      <View style={{ paddingTop: 40, marginBottom: 10 }}>
        <Text style={s.title}>{plant.name} — History</Text>
      </View>

      {/* Time Range Selector */}
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

      {/* ---- Moisture ---- */}
      <Text style={s.graphTitle}>Moisture (%)</Text>
      <LineChart
        data={{
          labels: moisture.labels,
          datasets: [{ data: moisture.data }],
        }}
        width={SCREEN_WIDTH}
        height={220}
        chartConfig={chartConfig}
        style={s.chart}
      />

      {/* ---- Temperature ---- */}
      <Text style={s.graphTitle}>Temperature (°C)</Text>
      <LineChart
        data={{
          labels: temperature.labels,
          datasets: [{ data: temperature.data }],
        }}
        width={SCREEN_WIDTH}
        height={220}
        chartConfig={chartConfig}
        style={s.chart}
      />

      {/* ---- Humidity ---- */}
      <Text style={s.graphTitle}>Humidity (%)</Text>
      <LineChart
        data={{
          labels: humidity.labels,
          datasets: [{ data: humidity.data }],
        }}
        width={SCREEN_WIDTH}
        height={220}
        chartConfig={chartConfig}
        style={s.chart}
      />

      {/* ---- Light ---- */}
      <Text style={s.graphTitle}>Light (lux)</Text>
      <LineChart
        data={{
          labels: light.labels,
          datasets: [{ data: light.data }],
        }}
        width={SCREEN_WIDTH}
        height={220}
        chartConfig={chartConfig}
        style={s.chart}
      />

      <View style={{ height: 100 }} />
    </ScrollView>
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
    fontSize: 26,
  },
  graphTitle: {
    fontFamily: fonts.sansSemi,
    color: colors.text,
    fontSize: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  chart: {
    borderRadius: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
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
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
  },
  rangeBtnActive: {
    backgroundColor: colors.primary,
  },
  rangeText: {
    fontFamily: fonts.sans,
    color: colors.textMuted,
    fontSize: 14,
  },
});
