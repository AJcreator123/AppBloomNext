import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../theme/colors";

export default function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void; }) {
  return (
    <View style={s.container}>
      <Ionicons name="search" size={18} color={colors.textMuted} />
      <TextInput
        style={s.input}
        placeholder="Search your plants..."
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={onChange}
      />
    </View>
  );
}
const s = StyleSheet.create({
  container: {
    marginHorizontal: 18,
    marginTop: 12,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: { flex: 1, color: colors.text, fontSize: 15 },
});
