// src/screens/AddPlantScreen.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";

import ModalSelector from "react-native-modal-selector";
import { Ionicons } from "@expo/vector-icons";

import colors from "../theme/colors";
import { fonts } from "../theme/typography";
import speciesList from "../data/speciesList";

export default function AddPlantScreen({ navigation }: any) {
  const [name, setName] = useState("");
  const [species, setSpecies] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");

  const onNext = () => {
    if (!name.trim() || !species) {
      Alert.alert("Missing info", "Please enter plant name and species.");
      return;
    }

    navigation.navigate("PairBloomPotScreen", {
      name: name.trim(),
      speciesCommonName: species,
      imageUrl: imageUrl.trim(),
    });
  };

  return (
    <View style={s.container}>

      {/* TOP HEADER */}
      <View style={s.topBanner}>

        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>

        {/* STEP CARD — ONE LINE */}
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

      {/* CONTENT AREA */}
      <View style={s.whiteArea}>

        <Text style={s.sectionTitle}>Plant Details</Text>

        <View style={s.fieldBox}>
          <Ionicons name="pricetag-outline" size={20} color={colors.primary} />
          <TextInput
            style={s.input}
            placeholder="Plant name (e.g. Freya)"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={s.fieldBox}>
          <Ionicons name="flower-outline" size={20} color={colors.primary} />

          <ModalSelector
            data={speciesList}
            initValue={species || "Select species"}
            onChange={(option) => setSpecies(option.key)}
            selectTextStyle={s.selectorText}
            optionTextStyle={s.selectorOption}
            optionContainerStyle={s.selectorOptionContainer}
            style={{ flex: 1 }}
          >
            <View>
              <Text style={species ? s.selectorSelected : s.selectorPlaceholder}>
                {species || "Select species"}
              </Text>
            </View>
          </ModalSelector>
        </View>

        <Text style={s.sectionTitle}>Image (Optional)</Text>

        <View style={s.fieldBox}>
          <Ionicons name="image-outline" size={20} color={colors.primary} />
          <TextInput
            style={s.input}
            placeholder="Paste plant image link"
            placeholderTextColor={colors.textMuted}
            value={imageUrl}
            onChangeText={setImageUrl}
          />
        </View>

        <TouchableOpacity style={s.nextButton} onPress={onNext}>
          <Text style={s.nextButtonText}>Next: Pair Bloom Pot</Text>
        </TouchableOpacity>

        <Text style={s.note}>
          You can upload your own image later from the Profile section.
        </Text>

      </View>

    </View>
  );
}

const s = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  topBanner: {
    paddingTop: 80,
    paddingBottom: 36,
    paddingHorizontal: 22,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },

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

  whiteArea: {
    flex: 1,
    marginTop: 26,
    paddingHorizontal: 22,
  },

  sectionTitle: {
    marginTop: 16,
    marginBottom: 6,
    fontFamily: fonts.sansSemi,
    fontSize: 15,
    color: colors.text,
  },

  fieldBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.panel,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
  },

  input: {
    flex: 1,
    marginLeft: 8,
    fontFamily: fonts.sans,
    color: colors.text,
    fontSize: 15,
  },

  selectorPlaceholder: {
    color: colors.textMuted,
    fontFamily: fonts.sans,
    marginLeft: 6,
  },

  selectorSelected: {
    color: colors.text,
    fontFamily: fonts.sansSemi,
    marginLeft: 6,
  },

  selectorText: { color: colors.text },

  selectorOption: {
    fontSize: 16,
    padding: 12,
    color: "#000",
  },

  selectorOptionContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
  },

  nextButton: {
    marginTop: 10,
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 26,
    alignItems: "center",
  },

  nextButtonText: {
    color: "#fff",
    fontFamily: fonts.sansSemi,
    fontSize: 16,
  },

  note: {
    marginTop: 10,
    textAlign: "center",
    color: colors.textMuted,
    fontSize: 13,
    fontFamily: fonts.sans,
  },
});
