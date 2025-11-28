import React from "react";
import { View, Text, StyleSheet } from "react-native";
import colors from "../theme/colors";
import { fonts } from "../theme/typography";

export default function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <View style={s.wrap}>
      <Text style={s.text}>{children}</Text>
    </View>
  );
}
const s = StyleSheet.create({
  wrap: { marginTop: 16, marginBottom: 10, paddingHorizontal: 18 },
  text: { fontFamily: fonts.sansSemi, fontSize: 16, color: colors.textMuted, letterSpacing: 0.3 },
});
