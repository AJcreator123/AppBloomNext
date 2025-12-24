// src/screens/AddPlantScreen.tsx

import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Image,
} from "react-native";

import ModalSelector from "react-native-modal-selector";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { fonts } from "../theme/typography";
import { themes } from "../theme/colors";
import { useThemeMode } from "../context/ThemeContext";
import speciesList from "../data/speciesList";

type SortMode = "default" | "az" | "za";

export default function AddPlantScreen({ navigation }: any) {
  const { mode } = useThemeMode();
  const colors = themes[mode];

  const [name, setName] = useState("");
  const [species, setSpecies] = useState<string | null>(null);

  // ✅ IMAGE PICKER STATE
  const [imageUri, setImageUri] = useState<string | null>(null);

  // dropdown-only state
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("default");

  const filteredSpecies = useMemo(() => {
    let list = [...speciesList];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) =>
        s.label.toLowerCase().includes(q)
      );
    }

    if (sortMode === "az") {
      list.sort((a, b) => a.label.localeCompare(b.label));
    }

    if (sortMode === "za") {
      list.sort((a, b) => b.label.localeCompare(a.label));
    }

    return list;
  }, [search, sortMode]);

  /* ================= IMAGE PICKER ================= */

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "Permission required",
        "Please allow photo access to choose a plant image."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const onNext = () => {
    if (!name.trim() || !species) {
      Alert.alert("Missing info", "Please enter plant name and species.");
      return;
    }

    navigation.navigate("PairBloomPotScreen", {
      name: name.trim(),
      speciesCommonName: species,
      imageUri, // ✅ now passing picked image
    });
  };

  return (
    <View style={s.container(colors)}>
      {/* TOP HEADER */}
      <View style={s.topBanner(colors)}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>

        <View style={s.stepCard}>
          <Text style={s.stepInlineText}>
            Step 1 of 2 • Plant Details
          </Text>
        </View>

        <Text style={s.headerMainText}>Add a new plant</Text>
        <Text style={s.headerSubText}>
          Give your plant an identity before linking a Bloom Pot.
        </Text>
      </View>

      {/* CONTENT */}
      <View style={s.contentArea}>
        <Text style={s.sectionTitle(colors)}>Plant Details</Text>

        <View style={s.fieldBox(colors)}>
          <Ionicons name="pricetag-outline" size={20} color={colors.primary} />
          <TextInput
            style={s.input(colors)}
            placeholder="Plant name (e.g. Freya)"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* SPECIES SELECTOR (UNCHANGED UI) */}
        <View style={s.fieldBox(colors)}>
          <Ionicons name="flower-outline" size={20} color={colors.primary} />

          <ModalSelector
            data={filteredSpecies}
            onModalOpen={() => {
              setSearch("");
              setSortMode("default");
            }}
            onChange={(option) => setSpecies(option.key)}
            overlayStyle={{ backgroundColor: "rgba(0,0,0,0.4)" }}
            optionContainerStyle={{
              backgroundColor: colors.card,
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
              maxHeight: "80%",
            }}
            header={
              <SafeAreaView
                style={{
                  padding: 14,
                  borderBottomWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                }}
              >
                <View
                  style={[
                    s.searchRow,
                    {
                      backgroundColor: colors.panel,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name="search-outline"
                    size={18}
                    color={colors.textMuted}
                  />
                  <TextInput
                    style={[s.searchInput, { color: colors.text }]}
                    placeholder="Search species"
                    placeholderTextColor={colors.textMuted}
                    value={search}
                    onChangeText={setSearch}
                  />
                </View>

                <View style={s.sortRow}>
                  <SortChip
                    label="A–Z"
                    active={sortMode === "az"}
                    onPress={() => setSortMode("az")}
                    colors={colors}
                  />
                  <SortChip
                    label="Z–A"
                    active={sortMode === "za"}
                    onPress={() => setSortMode("za")}
                    colors={colors}
                  />
                </View>
              </SafeAreaView>
            }
          >
            <View>
              <Text
                style={
                  species
                    ? s.selectorSelected(colors)
                    : s.selectorPlaceholder(colors)
                }
              >
                {species || "Select species"}
              </Text>
            </View>
          </ModalSelector>
        </View>

        {/* ✅ IMAGE PICKER (REPLACES IMAGE URL) */}
        <Text style={s.sectionTitle(colors)}>Plant Image (Optional)</Text>

        <TouchableOpacity
          style={s.imagePickerBox(colors)}
          onPress={pickImage}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={s.previewImage} />
          ) : (
            <>
              <Ionicons
                name="image-outline"
                size={22}
                color={colors.textMuted}
              />
              <Text style={s.imagePickerText(colors)}>
                Pick image from gallery
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.nextButton, { backgroundColor: colors.primary + "CC" }]}
          onPress={onNext}
        >
          <Text style={s.nextButtonText}>Next: Pair Bloom Pot</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

/* ===== SORT CHIP ===== */

function SortChip({ label, active, onPress, colors }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active ? colors.primary : colors.border,
        marginRight: 8,
      }}
    >
      <Text
        style={{
          color: active ? colors.primary : colors.textMuted,
          fontFamily: fonts.sansSemi,
          fontSize: 13,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/* ================= STYLES ================= */

const s = StyleSheet.create({
  container: (c: any) => ({
    flex: 1,
    backgroundColor: c.bg,
  }),

  topBanner: (c: any) => ({
    paddingTop: 80,
    paddingBottom: 36,
    paddingHorizontal: 22,
    backgroundColor: c.primary + "CC",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  }),

  backBtn: {
    position: "absolute",
    top: 46,
    left: 22,
  },

  stepCard: {
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    alignSelf: "flex-start",
    marginBottom: 20,
  },

  stepInlineText: {
    color: "#fff",
    fontFamily: fonts.sansSemi,
    fontSize: 14,
  },

  headerMainText: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: "#fff",
    marginBottom: 4,
  },

  headerSubText: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
  },

  contentArea: {
    flex: 1,
    marginTop: 26,
    paddingHorizontal: 22,
  },

  sectionTitle: (c: any) => ({
    marginTop: 16,
    marginBottom: 6,
    fontFamily: fonts.sansSemi,
    fontSize: 15,
    color: c.text,
  }),

  fieldBox: (c: any) => ({
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: c.panel,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: c.border,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
  }),

  input: (c: any) => ({
    flex: 1,
    marginLeft: 8,
    fontFamily: fonts.sans,
    color: c.text,
    fontSize: 15,
  }),

  selectorPlaceholder: (c: any) => ({
    color: c.textMuted,
    fontFamily: fonts.sans,
    marginLeft: 6,
  }),

  selectorSelected: (c: any) => ({
    color: c.text,
    fontFamily: fonts.sansSemi,
    marginLeft: 6,
  }),

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 10,
  },

  searchInput: {
    marginLeft: 8,
    flex: 1,
    fontFamily: fonts.sans,
  },

  sortRow: {
    flexDirection: "row",
  },

  imagePickerBox: (c: any) => ({
    height: 140,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.panel,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
    overflow: "hidden",
  }),

  imagePickerText: (c: any) => ({
    marginTop: 8,
    fontFamily: fonts.sans,
    color: c.textMuted,
  }),

  previewImage: {
    width: "100%",
    height: "100%",
  },

  nextButton: {
    marginTop: 10,
    paddingVertical: 15,
    borderRadius: 26,
    alignItems: "center",
  },

  nextButtonText: {
    color: "#fff",
    fontFamily: fonts.sansSemi,
    fontSize: 16,
  },

  note: (c: any) => ({
    marginTop: 10,
    textAlign: "center",
    color: c.textMuted,
    fontSize: 13,
    fontFamily: fonts.sans,
  }),
});
