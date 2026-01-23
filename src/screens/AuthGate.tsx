import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { themes } from "../theme/colors";
import { fonts } from "../theme/typography";
import { useThemeMode } from "../context/ThemeContext";

export default function AuthGate() {
  const { signInWithGoogle, signInWithApple, loading } = useAuth();
  const { mode } = useThemeMode();
  const colors = themes[mode];

  if (loading) {
    return (
      <View style={[s.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[s.container, { backgroundColor: colors.bg }]}>
      <Text style={[s.title, { color: colors.text }]}>
        Welcome to Bloom 🌱
      </Text>

      <Text style={[s.sub, { color: colors.textMuted }]}>
        Sign in to manage your plants and Bloom Pots.
      </Text>

      {/* 🍎 SIGN IN WITH APPLE (REQUIRED BY APPLE) */}
      <TouchableOpacity
        style={[s.appleBtn]}
        onPress={signInWithApple}
      >
        <Ionicons name="logo-apple" size={22} color="white" />
        <Text style={s.appleText}>Continue with Apple</Text>
      </TouchableOpacity>

      {/* GOOGLE */}
      <TouchableOpacity
        style={[s.googleBtn, { backgroundColor: colors.primary }]}
        onPress={signInWithGoogle}
      >
        <Ionicons name="logo-google" size={20} color="white" />
        <Text style={s.googleText}>Continue with Google</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 32,
    marginBottom: 6,
  },
  sub: {
    fontFamily: fonts.sans,
    fontSize: 14,
    marginBottom: 30,
    textAlign: "center",
  },

  /* APPLE */
  appleBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 26,
    backgroundColor: "#000",
    marginBottom: 14,
  },
  appleText: {
    color: "white",
    fontFamily: fonts.sansSemi,
    fontSize: 16,
    marginLeft: 10,
  },

  /* GOOGLE */
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 26,
  },
  googleText: {
    color: "white",
    fontFamily: fonts.sansSemi,
    fontSize: 16,
    marginLeft: 10,
  },
});
