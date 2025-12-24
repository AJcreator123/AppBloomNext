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

import { fonts } from "../theme/typography";
import { themes } from "../theme/colors";
import { useThemeMode } from "../context/ThemeContext";
import { usePlants } from "../context/PlantsContext";

const SCREEN_WIDTH = Dimensions.get("window").width - 32;

function generateFakeData(days: number, min: number, max: number) {
  const labels: string[] = [];
  const data: number[] = [];
  const step = Math.max(1, Math.floor(days / 7));

  for (let i = 0; i < days; i++) {
    if (i % step === 0) labels.push(`Day ${i + 1}`);
    else labels.push("");
    data.push(Math.floor(min + Math.random() * (max - min)));
  }

  return { labels, data };
}

export default function HistoryScreen({ route, navigation }: any) {
  const { mode } = useThemeMode();
  const colors = themes[mode];

  const { plantId } = route.params;
  const { plants } = usePlants();
  const plant = plants.find((p) => p.id === plantId);

  const [range, setRange] = useState<"week" | "month" | "year">("week");

  if (!plant) {
    return (
      <View style={s.center}>
        <Text style={[s.error, { color: colors.text }]}>
          Plant not found
        </Text>
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
    color: (opacity = 1) =>
      `rgba(76, 175, 80, ${opacity})`,
    labelColor: () => colors.textMuted,
    propsForDots: {
      r: "3",
      strokeWidth: "2",
      stroke: colors.primary,
    },
  };

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>
      {/* BACK BUTTON */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={[
          s.backBtn,
          { backgroundColor: colors.card },
        ]}
      >
        <Ionicons
          name="chevron-back"
          size={28}
          color={colors.text}
        />
      </TouchableOpacity>

      <ScrollView
        style={s.container}
        contentContainerStyle={{
          paddingTop: 96,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[s.title, { color: colors.text }]}>
          {plant.name} — History
        </Text>

        {/* RANGE SELECTOR */}
        <View style={s.rangeRow}>
          {["week", "month", "year"].map((r) => {
            const active = range === r;
            return (
              <TouchableOpacity
                key={r}
                onPress={() => setRange(r as any)}
                style={[
                  s.rangeBtn,
                  {
                    backgroundColor: active
                      ? colors.primary + "CC"
                      : colors.card,
                    borderColor: colors.line,
                  },
                ]}
              >
                <Text
                  style={[
                    s.rangeText,
                    {
                      color: active
                        ? "#fff"
                        : colors.textMuted,
                      fontFamily: active
                        ? fonts.sansSemi
                        : fonts.sans,
                    },
                  ]}
                >
                  {r === "week"
                    ? "7 Days"
                    : r === "month"
                    ? "30 Days"
                    : "1 Year"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* GRAPHS */}
        <Text style={[s.graphTitle, { color: colors.text }]}>
          Moisture (%)
        </Text>
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

        <Text style={[s.graphTitle, { color: colors.text }]}>
          Temperature (°C)
        </Text>
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

        <Text style={[s.graphTitle, { color: colors.text }]}>
          Humidity (%)
        </Text>
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

        <Text style={[s.graphTitle, { color: colors.text }]}>
          Light (lux)
        </Text>
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

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

/* ================= STYLES ================= */

const s = StyleSheet.create({
  root: {
    flex: 1,
  },

  container: {
    flex: 1,
    paddingHorizontal: 16,
  },

  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    marginBottom: 16,
  },

  graphTitle: {
    fontFamily: fonts.sansSemi,
    fontSize: 16,
    marginTop: 26,
    marginBottom: 8,
  },

  chart: {
    borderRadius: 16,
  },

  backBtn: {
    position: "absolute",
    top: 44,
    left: 16,
    zIndex: 999,
    padding: 8,
    borderRadius: 100,
    borderWidth: 1,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  error: {
    fontFamily: fonts.sansSemi,
    fontSize: 18,
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
    borderWidth: 1,
  },

  rangeText: {
    fontSize: 14,
  },
});
