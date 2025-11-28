import React from "react";
import { TouchableOpacity, Image, Text, StyleSheet, View } from "react-native";
import colors from "../theme/colors";
import { fonts } from "../theme/typography";

export default function PlantCard({ plant, onPress }: any) {
  return (
    <TouchableOpacity activeOpacity={0.88} onPress={onPress} style={s.card}>
      <Image source={{ uri: plant.image }} style={s.image} />
      <View style={s.info}>
        <Text style={s.name}>{plant.name}</Text>
        <Text style={s.sub}>{plant.species ?? "Indoor Plant"}</Text>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: colors.panel,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: 120,
    borderRadius: 14,
    backgroundColor: colors.panelSoft,
  },
  info: { marginTop: 10 },
  name: { fontFamily: fonts.sansSemi, fontSize: 17, color: colors.text },
  sub: { fontFamily: fonts.sans, fontSize: 12, color: colors.textMuted },
});
