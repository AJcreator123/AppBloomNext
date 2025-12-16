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
import speciesList from "../data/speciesList"; // ✅ now database-driven

export default function AddPlantScreen({ navigation }: any) {
  const [name, setName] = useState("");
  const [species, setSpecies] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");

  const onNext = () => {
    const trimmedName = name.trim();
    const trimmedImage = imageUrl.trim();

    if (!trimmedName || !species) {
      Alert.alert("Missing info", "Please enter both a plant name and species.");
      return;
    }

    navigation.navigate("PairBloomPotScreen", {
      name: trimmedName,
      speciesCommonName: species, // ✅ canonical database key
      imageUrl: trimmedImage,
    });
  };

  return (
    <View style={s.container}>
      {/* Back */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={s.backButton}>
        <Ionicons name="chevron-back" size={28} color={colors.text} />
      </TouchableOpacity>

      <Text style={s.title}>Add a new plant</Text>
      <Text style={s.subtitle}>
        First, select the plant species. On the next screen, you’ll link a Bloom Pot.
      </Text>

      {/* Name */}
      <TextInput
        style={s.input}
        placeholder="Plant name (e.g. Freya)"
        placeholderTextColor={colors.textMuted}
        value={name}
        onChangeText={setName}
      />

      {/* Species dropdown — DATABASE DRIVEN */}
      <ModalSelector
        data={speciesList}
        initValue={species || "Select plant species"}
        onChange={(option) => setSpecies(option.key)}
        style={s.selectorWrapper}
        selectTextStyle={s.selectorText}
        optionTextStyle={s.selectorOption}
        optionContainerStyle={s.selectorOptionContainer}
      >
        <View style={s.selectorInner}>
          <Text style={species ? s.selectorSelected : s.selectorPlaceholder}>
            {species || "Select plant species"}
          </Text>
        </View>
      </ModalSelector>

      {/* Image URL */}
      <TextInput
        style={s.input}
        placeholder="Image URL (optional)"
        placeholderTextColor={colors.textMuted}
        value={imageUrl}
        onChangeText={setImageUrl}
      />

      {/* Next */}
      <TouchableOpacity style={s.button} onPress={onNext}>
        <Text style={s.buttonText}>Next: Pair Bloom Pot</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: 40,
    paddingHorizontal: 18,
  },

  backButton: {
    marginBottom: 10,
    width: 40,
  },

  title: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: fonts.sans,
    color: colors.textMuted,
    marginBottom: 20,
  },

  input: {
    backgroundColor: colors.panel,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: fonts.sans,
    color: colors.text,
    marginBottom: 14,
  },

  selectorWrapper: {
    marginBottom: 14,
  },
  selectorInner: {
    backgroundColor: colors.panel,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  selectorPlaceholder: {
    color: colors.textMuted,
    fontFamily: fonts.sans,
  },
  selectorSelected: {
    color: colors.text,
    fontFamily: fonts.sansSemi,
  },

  selectorText: {
    color: colors.text,
  },
  selectorOption: {
    fontSize: 16,
    padding: 12,
    color: "#000",
  },
  selectorOptionContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
  },

  button: {
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontFamily: fonts.sansSemi,
    fontSize: 16,
  },
});
