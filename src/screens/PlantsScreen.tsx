import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Animated,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import colors from "../theme/colors";
import { fonts } from "../theme/typography";
import { usePlants } from "../context/PlantsContext";

const CARD_WIDTH = (Dimensions.get("window").width - 18 * 2 - 18) / 2;

export default function PlantsScreen({ navigation }: any) {
  const { plants } = usePlants();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 450,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[s.container, { opacity: fadeAnim }]}>
      <View style={s.headerRow}>
        <View>
          <Text style={s.subtitle}>Your Plants</Text>
          <Text style={s.title}>Bloom Garden</Text>
          <Text style={s.count}>{plants.length} total plants</Text>
        </View>

        <TouchableOpacity
          style={s.addButton}
          onPress={() => navigation.navigate("AddPlant")}
        >
          <Text style={s.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={plants}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        renderItem={({ item }) => (
          <PlantCard
            plant={item}
            onPress={() =>
              navigation.navigate("PlantDetail", { plantId: String(item.id) })
            }
          />
        )}
      />
    </Animated.View>
  );
}

function PlantCard({ plant, onPress }: any) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={s.card}>
      <Image
        source={{ uri: plant.image }}
        style={s.image}
        resizeMode="cover"
      />
      <View style={s.cardInfo}>
        <Text style={s.cardName}>{plant.name}</Text>
        <Text style={s.cardSpecies}>{plant.species}</Text>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: 60,   // more spacing here for top clarity
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
    color: colors.textMuted,
    fontSize: 13,
  },

  title: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.text,
    marginTop: 2,
  },

  count: {
    fontFamily: fonts.sans,
    color: colors.textMuted,
    marginTop: 4,
    fontSize: 13,
  },

  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },

  addButtonText: {
    color: "white",
    fontFamily: fonts.sansSemi,
    fontSize: 14,
  },

  card: {
    width: CARD_WIDTH,
    backgroundColor: "#121820",       // DARK card background
    borderRadius: 18,
    overflow: "hidden",

    // remove light outline & shadow
    borderWidth: 0,
    elevation: 0,
    marginBottom: 18,
  },

  image: {
    width: "100%",
    aspectRatio: 1,
  },

  cardInfo: {
    padding: 12,
  },

  cardName: {
    fontFamily: fonts.sansSemi,
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 2,
  },

  cardSpecies: {
    fontFamily: fonts.sans,
    color: "#9CA3AF",
    fontSize: 12,
  },
});
