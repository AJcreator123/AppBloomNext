// src/context/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

/* ================= TYPES ================= */

type User = {
  name: string;
  email: string;
  photo?: string;
};

type AuthCtx = {
  user: User | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthCtx | null>(null);
const USER_KEY = "@bloom_user";

/* ================= PROVIDER ================= */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /* ===== CONFIGURE GOOGLE SIGN-IN ===== */

  useEffect(() => {
    GoogleSignin.configure({
      // 🔐 REQUIRED
      webClientId:
        "1031881587398-kgb22d0of1sda8spffd7on1m99jojmbp.apps.googleusercontent.com",

      // 🍎 REQUIRED FOR iOS
      iosClientId:
        "1031881587398-1bkcq0vo6bos8076uemdqsger3bsak5k.apps.googleusercontent.com",

      scopes: ["profile", "email"],
      offlineAccess: false,
      forceCodeForRefreshToken: false,
    });

    const loadUser = async () => {
      try {
        const stored = await AsyncStorage.getItem(USER_KEY);
        if (stored) setUser(JSON.parse(stored));
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  /* ================= ACTIONS ================= */

  const signInWithGoogle = async () => {
    try {
      // Note: hasPlayServices is Android-only, skip on iOS
      const info = await GoogleSignin.signIn();

      // ✅ DEFENSIVE FIX — SUPPORT BOTH SHAPES
      const profile = info.user ?? info.data?.user;

      if (!profile?.email) {
        console.warn(
          "Google sign-in returned no usable profile",
          info
        );
        return;
      }

      const newUser: User = {
        name: profile.name ?? "User",
        email: profile.email,
        photo: profile.photo ?? undefined,
      };

      setUser(newUser);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser));
    } catch (error) {
      console.error("Google Sign-In error:", error);
    }
  };

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
    } finally {
      setUser(null);
      await AsyncStorage.removeItem(USER_KEY);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, signInWithGoogle, signOut, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ================= HOOK ================= */

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
