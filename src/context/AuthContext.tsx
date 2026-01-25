// src/context/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState } from "react";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import * as AppleAuthentication from "expo-apple-authentication";
import { supabase } from "../lib/supabase";

WebBrowser.maybeCompleteAuthSession();

/* ================= TYPES ================= */

type User = {
  id: string;
  email?: string;
};

type AuthCtx = {
  user: User | null;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthCtx | null>(null);

/* ================= PROVIDER ================= */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD SESSION ================= */

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user;
      if (sessionUser) {
        setUser({
          id: sessionUser.id,
          email: sessionUser.email ?? undefined,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user;
      if (sessionUser) {
        setUser({
          id: sessionUser.id,
          email: sessionUser.email ?? undefined,
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /* ================= REDIRECT URI ================= */

  const redirectUri = AuthSession.makeRedirectUri({
    scheme: "appbloom",
    useProxy: true,
  });

  /* ================= ACTIONS ================= */

  const signInWithGoogle = async () => {
    try {
      // 1. Get OAuth URL from Supabase (implicit flow)
      const { data } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
        },
      });

      if (!data?.url) {
        console.error("No OAuth URL returned");
        return;
      }

      // 2. Open browser
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUri
      );

      // 3. Parse access_token from redirect URL
      if (result.type === "success" && result.url) {
        const url = result.url;

        const params = new URLSearchParams(url.split("#")[1]);
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");

        if (!access_token || !refresh_token) {
          console.error("No tokens found in redirect URL");
          return;
        }

        // 4. Set session manually in Supabase
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (error) {
          console.error("Set session error:", error);
        }
      }
    } catch (err) {
      console.error("Google OAuth error:", err);
    }
  };

  const signInWithApple = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        console.error("No identity token returned from Apple");
        return;
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: "apple",
        token: credential.identityToken,
      });

      if (error) {
        console.error("Apple sign in error:", error);
      }
    } catch (err: any) {
      if (err.code === "ERR_REQUEST_CANCELED") {
        // User canceled the sign-in flow
        console.log("Apple sign in canceled");
      } else {
        console.error("Apple OAuth error:", err);
      }
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signInWithGoogle,
        signInWithApple,
        signOut,
        loading,
      }}
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
