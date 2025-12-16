import React, { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, FlatList } from "react-native";
import { useSelectedPlant } from "../hooks/useSelectedPlant";
import colors from "../theme/colors";

export default function PlantPickerScreen({ navigation }: any) {
  const { allPlants, selectedIndex, setPlantByIndex, isLoaded } = useSelectedPlant();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return allPlants.map((p, idx) => ({ p, idx }));
    return allPlants
      .map((p, idx) => ({ p, idx }))
      .filter(({ p }) => p.commonName.toLowerCase().includes(s) || p.scientificName.toLowerCase().includes(s));
  }, [q, allPlants]);

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, padding: 20 }}>
        <Text style={{ color: colors.text }}>Loading…</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, padding: 16 }}>
      <Text style={{ color: colors.text, fontSize: 22, fontWeight: "700" }}>
        Choose your plant
      </Text>

      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder="Search (e.g., peace lily, fern)…"
        placeholderTextColor={colors.textMuted}
        style={{
          marginTop: 12,
          backgroundColor: colors.card,
          color: colors.text,
          paddingHorizontal: 14,
          paddingVertical: 12,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.line,
        }}
      />

      <FlatList
        style={{ marginTop: 12 }}
        data={filtered}
        keyExtractor={(x) => String(x.idx)}
        renderItem={({ item }) => {
          const active = item.idx === selectedIndex;
          return (
            <Pressable
              onPress={async () => {
                await setPlantByIndex(item.idx);
                navigation.goBack();
              }}
              style={{
                padding: 14,
                borderRadius: 16,
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: active ? colors.primary : colors.line,
                marginBottom: 10,
              }}
            >
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: "650" }}>
                {item.p.commonName}
              </Text>
              <Text style={{ color: colors.textMuted, marginTop: 2 }}>
                {item.p.scientificName}
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}
