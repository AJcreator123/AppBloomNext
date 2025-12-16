// src/screens/ProfileScreen.tsx
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Easing,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../theme/colors";
import { fonts } from "../theme/typography";
import { usePlants } from "../context/PlantsContext";

export default function ProfileScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  // ⭐ Get plants from context (real–time)
  const { plants } = usePlants();
  const plantCount = plants.length;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 6,
        bounciness: 8,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        s.container,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      {/* Avatar */}
      <Image
        source={{ uri: "https://i.pravatar.cc/200?img=14" }}
        style={s.avatar}
      />

      {/* Name */}
      <Text style={s.name}>Ayaan Jamal</Text>
      <Text style={s.sub}>Plant caretaker • Growth mindset 🌱</Text>

      {/* Stats */}
      <View style={s.statsRow}>
        <View style={s.statCard}>
          <Ionicons name="leaf-outline" size={22} color={colors.accent} />
          <Text style={s.statLabel}>Plants</Text>
          <Text style={s.statValue}>{plantCount}</Text>
        </View>

        <View style={s.statCard}>
          <Ionicons name="water-outline" size={22} color={colors.accent} />
          <Text style={s.statLabel}>Watered</Text>
          <Text style={s.statValue}>12</Text>
        </View>

        <View style={s.statCard}>
          <Ionicons name="time-outline" size={22} color={colors.accent} />
          <Text style={s.statLabel}>Streak</Text>
          <Text style={s.statValue}>6 days</Text>
        </View>
      </View>

      {/* Settings */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Settings</Text>

        {/* ✅ NEW: Choose Plant */}
        <TouchableOpacity
          style={s.option}
          onPress={() => navigation.navigate("PlantPicker")}
        >
          <Ionicons name="leaf-outline" size={20} color={colors.text} />
          <Text style={s.optionText}>Choose Plant</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.option}>
          <Ionicons name="brush-outline" size={20} color={colors.text} />
          <Text style={s.optionText}>Appearance</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.option}>
          <Ionicons name="notifications-outline" size={20} color={colors.text} />
          <Text style={s.optionText}>Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.option}>
          <Ionicons
            name="shield-checkmark-outline"
            size={20}
            color={colors.text}
          />
          <Text style={s.optionText}>Privacy</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: 60,
    alignItems: "center",
    paddingHorizontal: 22,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 60,
    marginBottom: 14,
    borderWidth: 3,
    borderColor: colors.border,
  },
  name: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.text,
  },
  sub: {
    fontFamily: fonts.sans,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: 26,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 26,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 6,
    backgroundColor: colors.glass,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  statLabel: {
    fontFamily: fonts.sans,
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 6,
  },
  statValue: {
    fontFamily: fonts.sansBold,
    color: colors.text,
    fontSize: 17,
    marginTop: 2,
  },

  section: {
    width: "100%",
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
  },
  sectionTitle: {
    fontFamily: fonts.sansSemi,
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  optionText: {
    fontFamily: fonts.sans,
    color: colors.text,
    fontSize: 15,
    marginLeft: 10,
  },
});
