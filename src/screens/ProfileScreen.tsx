 import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  Animated,
  Easing,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { fonts } from "../theme/typography";
import { themes } from "../theme/colors";
import { useThemeMode } from "../context/ThemeContext";
import { usePlants } from "../context/PlantsContext";
import { useReadingsStore } from "../store/readingsStore";

const PROFILE_IMAGE_KEY = "@profile_image_uri";

export default function ProfileScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  const { plants } = usePlants();
  const plantCount = plants.length;
  const pairedCount = plants.filter(p => p.potMacAddress).length;

  const latestReading = useReadingsStore((s) => s.reading);

  const lastUpdateLabel = latestReading?.created_at
    ? new Date(latestReading.created_at).toLocaleTimeString()
    : "No data yet";

  const { mode, setMode } = useThemeMode();
  const colors = themes[mode];

  const [showThemePicker, setShowThemePicker] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  /* ================= LOAD PROFILE IMAGE ================= */

  useEffect(() => {
    const loadImage = async () => {
      const saved = await AsyncStorage.getItem(PROFILE_IMAGE_KEY);
      if (saved) setProfileImage(saved);
    };
    loadImage();
  }, []);

  /* ================= ANIMATION ================= */

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

  /* ================= IMAGE PICKER ================= */

  const changeProfilePhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "Permission required",
        "Please allow photo access to change your profile picture."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setProfileImage(uri);
      await AsyncStorage.setItem(PROFILE_IMAGE_KEY, uri);
    }
  };

  return (
    <>
      <Animated.View
        style={[
          s.container(colors),
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        {/* PROFILE IMAGE */}
        <TouchableOpacity onPress={changeProfilePhoto}>
          <Image
            source={{
              uri:
                profileImage ??
                "https://i.pravatar.cc/200?img=14",
            }}
            style={s.avatar(colors)}
          />
          <View style={s.cameraBadge(colors)}>
            <Ionicons name="camera-outline" size={16} color="white" />
          </View>
        </TouchableOpacity>

        {/* NAME */}
        <Text style={s.name(colors)}>User</Text>
        <Text style={s.sub(colors)}>
          Managing plants with Bloom 🌱
        </Text>

        {/* STATS */}
        <View style={s.statsRow}>
          <View style={s.statCard(colors)}>
            <Ionicons name="leaf-outline" size={22} color={colors.accent} />
            <Text style={s.statLabel(colors)}>Plants</Text>
            <Text style={s.statValue(colors)}>{plantCount}</Text>
          </View>

          <View style={s.statCard(colors)}>
            <Ionicons name="hardware-chip-outline" size={22} color={colors.accent} />
            <Text style={s.statLabel(colors)}>Paired Pots</Text>
            <Text style={s.statValue(colors)}>{pairedCount}</Text>
          </View>

          <View style={s.statCard(colors)}>
            <Ionicons name="time-outline" size={22} color={colors.accent} />
            <Text style={s.statLabel(colors)}>Last Update</Text>
            <Text style={s.statValue(colors)}>{lastUpdateLabel}</Text>
          </View>
        </View>

        {/* SETTINGS */}
        <View style={s.section(colors)}>
          <Text style={s.sectionTitle(colors)}>Settings</Text>

          <TouchableOpacity
            style={s.option}
            onPress={() => setShowThemePicker(true)}
          >
            <Ionicons name="brush-outline" size={20} color={colors.text} />
            <Text style={s.optionText(colors)}>Appearance</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* THEME PICKER */}
      <Modal transparent animationType="fade" visible={showThemePicker}>
        <TouchableOpacity
          style={s.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowThemePicker(false)}
        >
          <View style={s.modalCard(colors)}>
            <Text style={s.modalTitle(colors)}>Appearance</Text>

            {(["light", "dark"] as const).map((m) => (
              <TouchableOpacity
                key={m}
                style={s.themeOption}
                onPress={() => {
                  setMode(m);
                  setShowThemePicker(false);
                }}
              >
                <Ionicons
                  name={m === "light" ? "sunny-outline" : "moon-outline"}
                  size={20}
                  color={colors.text}
                />
                <Text style={s.optionText(colors)}>
                  {m === "light" ? "Light Mode" : "Dark Mode"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

/* ================= STYLES ================= */

const s = {
  container: (c: any) => ({
    flex: 1,
    backgroundColor: c.bg,
    paddingTop: 60,
    alignItems: "center",
    paddingHorizontal: 22,
  }),

  avatar: (c: any) => ({
    width: 110,
    height: 110,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: c.border,
  }),

  cameraBadge: (c: any) => ({
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: c.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  }),

  name: (c: any) => ({
    fontFamily: fonts.display,
    fontSize: 28,
    color: c.text,
    marginTop: 14,
  }),

  sub: (c: any) => ({
    fontFamily: fonts.sans,
    color: c.textMuted,
    marginTop: 4,
    marginBottom: 26,
  }),

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 26,
  },

  statCard: (c: any) => ({
    flex: 1,
    marginHorizontal: 6,
    backgroundColor: c.glass,
    borderColor: c.border,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  }),

  statLabel: (c: any) => ({
    fontFamily: fonts.sans,
    color: c.textMuted,
    fontSize: 13,
    marginTop: 6,
    textAlign: "center",
  }),

  statValue: (c: any) => ({
    fontFamily: fonts.sansBold,
    color: c.text,
    fontSize: 15,
    marginTop: 4,
  }),

  section: (c: any) => ({
    width: "100%",
    backgroundColor: c.card,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: c.line,
  }),

  sectionTitle: (c: any) => ({
    fontFamily: fonts.sansSemi,
    fontSize: 16,
    color: c.text,
    marginBottom: 12,
  }),

  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },

  optionText: (c: any) => ({
    fontFamily: fonts.sans,
    color: c.text,
    fontSize: 15,
    marginLeft: 10,
  }),

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalCard: (c: any) => ({
    width: "80%",
    backgroundColor: c.card,
    borderRadius: 18,
    padding: 18,
  }),

  modalTitle: (c: any) => ({
    fontFamily: fonts.sansSemi,
    fontSize: 18,
    color: c.text,
    marginBottom: 12,
  }),

  themeOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
};
