import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../theme/colors";
import { fonts } from "../theme/typography";

export default function AppHeader() {
  return (
    <View style={s.wrap}>
      <Text style={s.brand}>Bloom</Text>
      <View style={s.right}>
        <Ionicons name="notifications-outline" size={22} color={colors.text} />
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  wrap: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "transparent" },
  brand: { fontFamily: fonts.display, fontSize: 28, color: colors.primary, letterSpacing: 0.5 },
  right: { flexDirection: "row", gap: 16 },
});
