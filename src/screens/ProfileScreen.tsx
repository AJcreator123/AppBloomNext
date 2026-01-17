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
  TextInput,
  Linking
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

import { fonts } from "../theme/typography";
import { themes } from "../theme/colors";
import { useThemeMode } from "../context/ThemeContext";
import { usePlants } from "../context/PlantsContext";
import { useReadingsStore } from "../store/readingsStore";
import { useAuth } from "../context/AuthContext";

const PROFILE_IMAGE_KEY = "@profile_image_uri";
const USERNAME_KEY = "@profile_username";

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { signOut } = useAuth();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  const { plants } = usePlants();
  const plantCount = plants.length;
  const pairedCount = plants.filter((p) => p.potMacAddress).length;

  const latestReading = useReadingsStore((s) => s.reading);
  const lastUpdateLabel = latestReading?.created_at
    ? new Date(latestReading.created_at).toLocaleTimeString()
    : "No data yet";

  const { mode, setMode } = useThemeMode();
  const colors = themes[mode];

  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [username, setUsername] = useState("Bloom User");
  const [editingName, setEditingName] = useState(false);

  const [deleteReason, setDeleteReason] = useState("");
  const [deleting, setDeleting] = useState(false);

  /* ================= LOAD PROFILE ================= */

  useEffect(() => {
    (async () => {
      const img = await AsyncStorage.getItem(PROFILE_IMAGE_KEY);
      const name = await AsyncStorage.getItem(USERNAME_KEY);
      if (img) setProfileImage(img);
      if (name) setUsername(name);
    })();
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

  /* ================= LOGOUT (FIXED) ================= */

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          // ✅ This is the auth system your app actually uses
          await signOut();
          // AppNavigator will automatically show AuthGate because user becomes null
        },
      },
    ]);
  };

  /* ================= DELETE ACCOUNT (FIXED FOR YOUR ARCH) =================
     Your current app does NOT create/delete Supabase auth users.
     So “delete account” here means:
       - collect reason
       - clear local profile state
       - sign out of Google
       - return to AuthGate via AppNavigator (auth-driven)
  */

  const confirmDeleteAccount = async () => {
    if (!deleteReason.trim()) {
      Alert.alert("Required", "Please tell us why you want to delete your account.");
      return;
    }

    Alert.alert(
      "Delete account",
      "This will sign you out and remove your local profile data on this device. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(true);

              // Remove local profile data
              await AsyncStorage.multiRemove([PROFILE_IMAGE_KEY, USERNAME_KEY]);

              // You can optionally log this to your backend later.
              // For now, we simply proceed with sign-out.
              await signOut();

              // Close modal (in case AuthGate render is slightly delayed)
              setShowDeleteModal(false);
              setDeleteReason("");
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <Animated.View
        style={[
          styles.container(colors),
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        {/* PROFILE IMAGE */}
        <TouchableOpacity onPress={changeProfilePhoto}>
          <Image
            source={{
              uri:
                profileImage ??
                "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=400&auto=format&fit=crop",
            }}
            style={styles.avatar(colors)}
          />
          <View style={styles.cameraBadge(colors)}>
            <Ionicons name="camera-outline" size={16} color="white" />
          </View>
        </TouchableOpacity>

        {/* NAME */}
        {editingName ? (
          <TextInput
            value={username}
            onChangeText={setUsername}
            onBlur={async () => {
              setEditingName(false);
              await AsyncStorage.setItem(USERNAME_KEY, username.trim() || "Bloom User");
            }}
            style={styles.nameInput(colors)}
            autoFocus
            placeholder="Your name"
            placeholderTextColor={colors.textMuted}
          />
        ) : (
          <TouchableOpacity onPress={() => setEditingName(true)}>
            <Text style={styles.name(colors)}>{username}</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.sub(colors)}>Managing plants with Bloom 🌱</Text>

        {/* PRIVACY POLICY LINK (IN-APP, NO FIREWALL) */}
        {/* PRIVACY POLICY LINK */}
<TouchableOpacity
  onPress={() => {
    Linking.openURL("https://www.bloom-pots.com/privacy");
  }}
>
  <Text style={styles.link(colors)}>Privacy Policy</Text>
</TouchableOpacity>


        {/* STATS */}
        <View style={styles.statsRow}>
          <View style={styles.statCard(colors)}>
            <Ionicons name="leaf-outline" size={22} color={colors.accent} />
            <Text style={styles.statLabel(colors)}>Plants</Text>
            <Text style={styles.statValue(colors)}>{plantCount}</Text>
          </View>

          <View style={styles.statCard(colors)}>
            <Ionicons
              name="hardware-chip-outline"
              size={22}
              color={colors.accent}
            />
            <Text style={styles.statLabel(colors)}>Paired Pots</Text>
            <Text style={styles.statValue(colors)}>{pairedCount}</Text>
          </View>

          <View style={styles.statCard(colors)}>
            <Ionicons name="time-outline" size={22} color={colors.accent} />
            <Text style={styles.statLabel(colors)}>Last Update</Text>
            <Text style={styles.statValue(colors)}>{lastUpdateLabel}</Text>
          </View>
        </View>

        {/* SETTINGS */}
        <View style={styles.section(colors)}>
          <Text style={styles.sectionTitle(colors)}>Settings</Text>

          <TouchableOpacity
            style={styles.option}
            onPress={() => setShowThemePicker(true)}
          >
            <Ionicons name="brush-outline" size={20} color={colors.text} />
            <Text style={styles.optionText(colors)}>Appearance</Text>
          </TouchableOpacity>
        </View>

        {/* ACCOUNT */}
        <View style={[styles.section(colors), { marginTop: 14 }]}>
          <Text style={styles.sectionTitle(colors)}>Account</Text>

          <TouchableOpacity style={styles.option} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={colors.text} />
            <Text style={styles.optionText(colors)}>Log out</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => setShowDeleteModal(true)}
          >
            <Text style={styles.deleteText}>Delete account</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* THEME PICKER */}
      <Modal transparent animationType="fade" visible={showThemePicker}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowThemePicker(false)}
        >
          <View style={styles.modalCard(colors)}>
            <Text style={styles.modalTitle(colors)}>Appearance</Text>

            {(["light", "dark"] as const).map((m) => (
              <TouchableOpacity
                key={m}
                style={styles.themeOption}
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
                <Text style={styles.optionText(colors)}>
                  {m === "light" ? "Light Mode" : "Dark Mode"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* DELETE ACCOUNT MODAL */}
      <Modal transparent animationType="fade" visible={showDeleteModal}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            if (!deleting) setShowDeleteModal(false);
          }}
        >
          <View style={styles.modalCard(colors)}>
            <Text style={styles.modalTitle(colors)}>Delete account</Text>
            <Text style={styles.modalSub(colors)}>
              Tell us why you’re deleting your account. This helps us improve.
            </Text>

            <TextInput
              value={deleteReason}
              onChangeText={setDeleteReason}
              placeholder="Reason..."
              placeholderTextColor={colors.textMuted}
              style={styles.input(colors)}
              multiline
            />

            <TouchableOpacity
              style={[
                styles.deleteBtn,
                {
                  opacity: deleting || !deleteReason.trim() ? 0.6 : 1,
                },
              ]}
              disabled={deleting || !deleteReason.trim()}
              onPress={confirmDeleteAccount}
            >
              <Text style={styles.deleteText}>
                {deleting ? "Deleting..." : "Confirm delete"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (!deleting) setShowDeleteModal(false);
              }}
              style={{ marginTop: 10 }}
            >
              <Text style={styles.cancelText(colors)}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

/* ================= STYLES ================= */

const styles = {
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

  nameInput: (c: any) => ({
    fontFamily: fonts.display,
    fontSize: 28,
    color: c.text,
    marginTop: 14,
    borderBottomWidth: 1,
    borderColor: c.border,
    paddingBottom: 6,
    minWidth: 220,
    textAlign: "center",
  }),

  sub: (c: any) => ({
    fontFamily: fonts.sans,
    color: c.textMuted,
    marginTop: 4,
    marginBottom: 10,
  }),

  link: (c: any) => ({
    fontFamily: fonts.sansSemi,
    color: c.accent,
    fontSize: 13,
    marginBottom: 22,
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

  deleteBtn: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#ff3b30",
    alignItems: "center",
  },

  deleteText: {
    color: "white",
    fontFamily: fonts.sansSemi,
    fontSize: 15,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 18,
  },

  modalCard: (c: any) => ({
    width: "100%",
    maxWidth: 420,
    backgroundColor: c.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: c.line,
  }),

  modalTitle: (c: any) => ({
    fontFamily: fonts.sansSemi,
    fontSize: 18,
    color: c.text,
    marginBottom: 8,
  }),

  modalSub: (c: any) => ({
    fontFamily: fonts.sans,
    fontSize: 13,
    color: c.textMuted,
    marginBottom: 12,
    lineHeight: 18,
  }),

  input: (c: any) => ({
    minHeight: 90,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.line,
    padding: 12,
    color: c.text,
    fontFamily: fonts.sans,
    backgroundColor: c.glass,
  }),

  cancelText: (c: any) => ({
    fontFamily: fonts.sansSemi,
    color: c.textMuted,
    textAlign: "center",
  }),

  themeOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
};
