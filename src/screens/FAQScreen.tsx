import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import colors from "../theme/colors";
import { fonts } from "../theme/typography";

export default function FAQScreen() {
  return (
    <View style={s.container}>
      <Text style={s.title}>FAQ</Text>
      <Text style={s.subtitle}>Quick answers about Bloom & your pots.</Text>

      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={s.card}>
          <Text style={s.q}>How often does the app update live vitals?</Text>
          <Text style={s.a}>
            The Bloom pot sends fresh data every few seconds while it’s powered
            and connected to Wi-Fi. If readings appear “stuck”, check power,
            Wi-Fi, or move the pot closer to your router.
          </Text>
        </View>

        <View style={s.card}>
          <Text style={s.q}>What do the “happy / caution” states mean?</Text>
          <Text style={s.a}>
            Bloom combines moisture, light, and temperature to estimate whether
            your plant is comfortable. “Caution” usually means one of the
            readings has been outside the recommended range for a while.
          </Text>
        </View>

        <View style={s.card}>
          <Text style={s.q}>Can I use Bloom with multiple pots?</Text>
          <Text style={s.a}>
            Yes — each sensor pot can be assigned to a plant in the app. Support
            for linking multiple devices per account is built into this layout.
          </Text>
        </View>

        <View style={s.card}>
          <Text style={s.q}>Does Bloom work offline?</Text>
          <Text style={s.a}>
            If the pot loses Wi-Fi, it will stop sending new readings. You’ll
            still see the last known values in the app, and everything will
            resume as soon as it reconnects.
          </Text>
        </View>
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
    fontSize: 28,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.sans,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    marginBottom: 12,
  },
  q: {
    fontFamily: fonts.sansSemi,
    color: colors.text,
    marginBottom: 6,
  },
  a: {
    fontFamily: fonts.sans,
    color: colors.textMuted,
    lineHeight: 20,
  },
});
