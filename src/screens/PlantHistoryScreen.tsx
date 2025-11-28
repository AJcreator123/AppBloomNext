import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import colors from "../theme/colors";
import { fonts } from "../theme/typography";
import { usePlants } from "../context/PlantsContext";

export default function PlantHistoryScreen({ route }: any) {
  const { plants } = usePlants();
  const plantId = route.params?.plantId;
  const plant = (plantId && plants.find((p) => p.id === plantId)) || plants[0];

  const vitals = plant.vitals || {
    temp: 24,
    moisture: 40,
    light: 800,
    humidity: 45,
  };

  const history = [
    {
      label: "Today",
      temp: vitals.temp,
      moisture: vitals.moisture,
      light: vitals.light,
    },
    {
      label: "Yesterday",
      temp: vitals.temp - 1,
      moisture: vitals.moisture + 5,
      light: vitals.light - 150,
    },
    {
      label: "2 days ago",
      temp: vitals.temp + 0.5,
      moisture: vitals.moisture - 8,
      light: vitals.light + 200,
    },
  ];

  return (
    <View style={s.container}>
      <Text style={s.title}>{plant.name} history</Text>
      <Text style={s.subtitle}>Recent snapshots of your plant’s vitals.</Text>

      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {history.map((entry, idx) => (
          <View key={idx} style={s.entry}>
            <Text style={s.entryLabel}>{entry.label}</Text>
            <Text style={s.entryLine}>
              Temp: <Text style={s.entryValue}>{entry.temp}°C</Text>
            </Text>
            <Text style={s.entryLine}>
              Moisture: <Text style={s.entryValue}>{entry.moisture}%</Text>
            </Text>
            <Text style={s.entryLine}>
              Light: <Text style={s.entryValue}>{entry.light} lux</Text>
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: 40,
    paddingHorizontal: 18,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: fonts.sans,
    color: colors.textMuted,
    marginBottom: 16,
  },
  entry: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    marginBottom: 10,
  },
  entryLabel: {
    fontFamily: fonts.sansSemi,
    color: colors.text,
    marginBottom: 6,
  },
  entryLine: {
    fontFamily: fonts.sans,
    color: colors.textMuted,
    fontSize: 14,
  },
  entryValue: {
    fontFamily: fonts.sansSemi,
    color: colors.text,
  },
});
