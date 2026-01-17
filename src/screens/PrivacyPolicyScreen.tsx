import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { themes } from "../theme/colors";
import { fonts } from "../theme/typography";
import { useThemeMode } from "../context/ThemeContext";

export default function PrivacyPolicyScreen() {
  const navigation = useNavigation<any>();
  const { mode } = useThemeMode();
  const colors = themes[mode];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View
        style={{
          paddingTop: 54,
          paddingHorizontal: 18,
          paddingBottom: 12,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text
          style={{
            fontFamily: fonts.sansSemi,
            fontSize: 18,
            color: colors.text,
          }}
        >
          Privacy Policy
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 40 }}
      >
        <Text
          style={{
            fontFamily: fonts.sans,
            fontSize: 14,
            color: colors.textMuted,
            lineHeight: 20,
          }}
        >
          This is a placeholder privacy policy screen. Replace this text with
          your actual policy before shipping to the App Store / Play Store.
          {"\n\n"}
          Typical sections include: what data you collect, why you collect it,
          how it is stored, whether you share it, and how users can delete their
          data.
          {"\n\n"}
          If you want, I can generate a Bloom-specific privacy policy draft based
          on your features (Google Sign-In, plant data, Bloom Pot telemetry,
          analytics, etc.).
        </Text>
      </ScrollView>
    </View>
  );
}
