import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Animated,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
} from "react-native";

import { fonts } from "../theme/typography";
import { themes } from "../theme/colors";
import { useThemeMode } from "../context/ThemeContext";
import { usePlants } from "../context/PlantsContext";
import { useNotifications } from "../context/NotificationContext";

const CARD_WIDTH = (Dimensions.get("window").width - 18 * 2 - 18) / 2;

export default function PlantsScreen({ navigation }: any) {
  const { mode } = useThemeMode();
  const colors = themes[mode];

  const { plants } = usePlants();
  const { status, requestPermission } = useNotifications();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showNotifPrompt, setShowNotifPrompt] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 450,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (status === "undetermined") {
      setShowNotifPrompt(true);
    }
  }, [status]);

  return (
    <>
      <Animated.View
        style={[
          s.container,
          { opacity: fadeAnim, backgroundColor: colors.bg },
        ]}
      >
        {/* HEADER */}
        <View style={s.headerRow}>
          <View>
            <Text style={[s.subtitle, { color: colors.textMuted }]}>
              Your Plants
            </Text>
            <Text style={[s.title, { color: colors.text }]}>
              Bloom Garden
            </Text>
            <Text style={[s.count, { color: colors.textMuted }]}>
              {plants.length} total plants
            </Text>
          </View>

          <TouchableOpacity
            style={[
              s.addButton,
              { backgroundColor: colors.primary + "CC" },
            ]}
            onPress={() => navigation.navigate("AddPlant")}
          >
            <Text style={s.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* GRID */}
        <FlatList
          data={plants}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={{ paddingBottom: 140 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.86}
              style={[
                s.card,
                {
                  backgroundColor:
                    mode === "dark"
                      ? "#1F2937" // ⬅ richer slate surface
                      : "#F8FAFC",

                  borderColor:
                    mode === "dark"
                      ? "rgba(255,255,255,0.12)"
                      : "rgba(15,23,42,0.08)",

                  shadowOpacity: mode === "dark" ? 0.35 : 0.12,
                  shadowRadius: mode === "dark" ? 18 : 12,
                },
              ]}
              onPress={() =>
                navigation.navigate("PlantDetail", {
                  plantId: String(item.id),
                })
              }
            >
              <Image
                source={{ uri: item.image }}
                style={s.image}
              />

              <View style={s.cardInfo}>
                <Text style={[s.cardName, { color: colors.text }]}>
                  {item.name}
                </Text>
                <Text
                  style={[
                    s.cardSpecies,
                    { color: colors.textMuted },
                  ]}
                >
                  {item.species}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </Animated.View>

      {/* NOTIFICATION PROMPT */}
      <Modal transparent visible={showNotifPrompt} animationType="fade">
        <View style={s.modalOverlay}>
          <View style={[s.modalCard, { backgroundColor: colors.card }]}>
            <Text style={[s.modalTitle, { color: colors.text }]}>
              Enable Notifications?
            </Text>

            <Text style={[s.modalText, { color: colors.textMuted }]}>
              Get reminders when your plants need watering or attention.
            </Text>

            <TouchableOpacity
              style={[s.modalBtn, { backgroundColor: colors.primary }]}
              onPress={async () => {
                await requestPermission();
                setShowNotifPrompt(false);
              }}
            >
              <Text style={s.modalBtnText}>Enable</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowNotifPrompt(false)}>
              <Text style={[s.modalSkip, { color: colors.textMuted }]}>
                Not now
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

/* ================= STYLES ================= */

const s = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 18,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 26,
  },

  subtitle: {
    fontFamily: fonts.sans,
    fontSize: 13,
  },

  title: {
    fontFamily: fonts.display,
    fontSize: 32,
  },

  count: {
    fontFamily: fonts.sans,
    fontSize: 13,
  },

  addButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },

  addButtonText: {
    color: "#fff",
    fontFamily: fonts.sansSemi,
  },

  /* 🌱 CARD */
  card: {
    width: CARD_WIDTH,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 18,
    overflow: "hidden",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },

  image: {
    width: "100%",
    aspectRatio: 1,
  },

  cardInfo: {
    padding: 14,
  },

  cardName: {
    fontFamily: fonts.sansSemi,
    fontSize: 16,
    marginBottom: 2,
  },

  cardSpecies: {
    fontFamily: fonts.sans,
    fontSize: 12,
  },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalCard: {
    width: "80%",
    borderRadius: 20,
    padding: 20,
  },

  modalTitle: {
    fontFamily: fonts.sansSemi,
    fontSize: 20,
    marginBottom: 8,
  },

  modalText: {
    fontFamily: fonts.sans,
    marginBottom: 18,
  },

  modalBtn: {
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 12,
  },

  modalBtnText: {
    color: "#fff",
    fontFamily: fonts.sansSemi,
    fontSize: 16,
  },

  modalSkip: {
    textAlign: "center",
    fontFamily: fonts.sans,
  },
});
