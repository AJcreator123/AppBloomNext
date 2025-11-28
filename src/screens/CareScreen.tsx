import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../theme/colors";
import { fonts } from "../theme/typography";

function CareCard({
  icon,
  title,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  children: string;
}) {
  return (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <Ionicons name={icon} size={20} color={colors.accent} />
        <Text style={s.cardTitle}>{title}</Text>
      </View>
      <Text style={s.cardText}>{children}</Text>
    </View>
  );
}

export default function CareScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[s.container, { opacity: fadeAnim }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <Text style={s.title}>Care Tips</Text>

        <CareCard icon="calendar-outline" title="This Week">
          Water Monstera once; rotate Snake Plant 90° for even light; mist Peace
          Lily lightly.
        </CareCard>

        <CareCard icon="sunny-outline" title="Environment">
          Bright, indirect light near a window. Avoid drafts. Keep temperature
          between 20–24°C and humidity around ~50%.
        </CareCard>

        <CareCard icon="leaf-outline" title="Soil & Nutrition">
          Use an airy mix (peat/perlite/bark). Apply a balanced fertilizer every
          4–6 weeks during growing season.
        </CareCard>

        <CareCard icon="water-outline" title="Watering Rhythm">
          Water when the top 2–3cm of soil feels dry. Ensure proper drainage to
          prevent overwatering.
        </CareCard>

        <CareCard icon="pulse-outline" title="Health Checks">
          Look for yellowing leaves, brown tips, or drooping — these are early
          signs of stress. Adjust watering or lighting accordingly.
        </CareCard>
      </ScrollView>
    </Animated.View>
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
    fontSize: 30,
    color: colors.text,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.glass,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 16,
    borderRadius: 18,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  cardTitle: {
    fontFamily: fonts.sansSemi,
    fontSize: 16,
    color: colors.text,
    marginLeft: 6,
  },
  cardText: {
    fontFamily: fonts.sans,
    lineHeight: 20,
    color: colors.textMuted,
  },
});
