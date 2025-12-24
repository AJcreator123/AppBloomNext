import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { fonts } from "../theme/typography";
import { themes } from "../theme/colors";
import { useThemeMode } from "../context/ThemeContext";

import {
  PlantProfile,
  searchPlantProfiles,
} from "../engine/plantProfiles";

/* ======================
   Helpers
====================== */

const pct = (x?: number) =>
  typeof x === "number" ? `${Math.round(x * 100)}%` : "—";

const lux = (x?: number) =>
  typeof x === "number" ? `${Math.round(x).toLocaleString()} lux` : "—";

/* ======================
   UI Components
====================== */

function InfoChip({
  label,
  colors,
}: {
  label: string;
  colors: any;
}) {
  return (
    <View
      style={[
        s.chip,
        {
          backgroundColor: colors.panel,
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={[s.chipText, { color: colors.text }]}>
        {label}
      </Text>
    </View>
  );
}

function CareCard({
  icon,
  title,
  accent,
  colors,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  accent: string;
  colors: any;
  children: React.ReactNode;
}) {
  return (
    <View
      style={[
        s.card,
        {
          backgroundColor: colors.card,
          borderLeftColor: accent,
        },
      ]}
    >
      <View style={s.cardHeader}>
        <Ionicons name={icon} size={20} color={accent} />
        <Text style={[s.cardTitle, { color: colors.text }]}>
          {title}
        </Text>
      </View>
      <View style={s.cardBody}>{children}</View>
    </View>
  );
}

/* ======================
   Screen
====================== */

export default function CareScreen() {
  const { mode } = useThemeMode();
  const colors = themes[mode];

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<PlantProfile | null>(null);

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    return searchPlantProfiles(query).slice(0, 6);
  }, [query]);

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>
      {/* HERO HEADER */}
      <View
        style={[
          s.hero,
          { backgroundColor: colors.primary + "22" },
        ]}
      >
        <Text style={[s.heroTitle, { color: colors.primary }]}>
          Plant Care
        </Text>
        <Text
          style={[
            s.heroSubtitle,
            { color: colors.textMuted },
          ]}
        >
          Personalized guidance, powered by Bloom intelligence.
        </Text>

        {/* SEARCH */}
        <View
          style={[
            s.searchWrapper,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons
            name="search-outline"
            size={18}
            color={colors.primary}
          />
          <TextInput
            value={query}
            onChangeText={(t) => {
              setQuery(t);
              setSelected(null);
            }}
            placeholder="Search a plant (e.g. African Violet)"
            placeholderTextColor={colors.textMuted}
            style={[
              s.searchInput,
              { color: colors.text },
            ]}
          />

          {!!query && (
            <TouchableOpacity
              onPress={() => {
                setQuery("");
                setSelected(null);
              }}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 160 }}
      >
        {/* SUGGESTIONS */}
        {!selected && suggestions.length > 0 && (
          <View
            style={[
              s.suggestionBox,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            {suggestions.map((p) => (
              <TouchableOpacity
                key={p.commonName}
                style={[
                  s.suggestionRow,
                  { borderBottomColor: colors.border },
                ]}
                onPress={() => {
                  setSelected(p);
                  setQuery(p.commonName);
                }}
              >
                <View>
                  <Text
                    style={[
                      s.suggestionName,
                      { color: colors.text },
                    ]}
                  >
                    {p.commonName}
                  </Text>
                  <Text
                    style={[
                      s.suggestionSub,
                      { color: colors.textMuted },
                    ]}
                  >
                    {p.scientificName} • {p.category}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* EMPTY STATE */}
        {!selected && !query && (
          <View style={s.emptyState}>
            <Ionicons
              name="leaf-outline"
              size={50}
              color={colors.primary}
            />
            <Text
              style={[
                s.emptyTitle,
                { color: colors.text },
              ]}
            >
              Search a plant
            </Text>
            <Text
              style={[
                s.emptyText,
                { color: colors.textMuted },
              ]}
            >
              Discover exactly how to care for your plant, based on real data.
            </Text>
          </View>
        )}

        {/* CARE CONTENT */}
        {selected && (
          <>
            <View style={s.speciesHeader}>
              <Text
                style={[
                  s.speciesName,
                  { color: colors.text },
                ]}
              >
                {selected.commonName}
              </Text>
              <Text
                style={[
                  s.speciesMeta,
                  { color: colors.textMuted },
                ]}
              >
                {selected.scientificName} • {selected.category}
              </Text>
            </View>

            <CareCard
              icon="sunny-outline"
              title="Light"
              accent="#F9A825"
              colors={colors}
            >
              <View style={s.chipRow}>
                <InfoChip
                  label={`Min: ${lux(selected.LMin)}`}
                  colors={colors}
                />
                <InfoChip
                  label={`Ideal: ${lux(selected.lightPreference)}`}
                  colors={colors}
                />
              </View>

              <Text
                style={[
                  s.cardText,
                  { color: colors.textMuted },
                ]}
              >
                This plant grows best when light levels stay close
                to its ideal range. Sudden drops can slow growth.
              </Text>
            </CareCard>

            <CareCard
              icon="water-outline"
              title="Watering"
              accent="#0288D1"
              colors={colors}
            >
              <View style={s.chipRow}>
                <InfoChip
                  label={`Min: ${pct(selected.WMin)}`}
                  colors={colors}
                />
                <InfoChip
                  label={`Wilt: ${pct(selected.thetaWp)}`}
                  colors={colors}
                />
                <InfoChip
                  label={`Comfort: ${pct(selected.thetaFc)}`}
                  colors={colors}
                />
              </View>

              <Text
                style={[
                  s.cardText,
                  { color: colors.textMuted },
                ]}
              >
                Keeping moisture above the wilting threshold
                ensures steady, healthy growth.
              </Text>
            </CareCard>

            <CareCard
              icon="leaf-outline"
              title="Growth Notes"
              accent="#43A047"
              colors={colors}
            >
              <Text
                style={[
                  s.cardText,
                  { color: colors.textMuted },
                ]}
              >
                This species belongs to the{" "}
                <Text style={{ color: colors.text }}>
                  {selected.category}
                </Text>{" "}
                category. Stability matters more than frequent
                changes.
              </Text>
            </CareCard>
          </>
        )}
      </ScrollView>
    </View>
  );
}

/* ======================
   Styles (layout-only)
====================== */

const s = StyleSheet.create({
  root: {
    flex: 1,
  },

  hero: {
    paddingTop: 84,
    paddingHorizontal: 18,
    paddingBottom: 26,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  heroTitle: {
    fontFamily: fonts.display,
    fontSize: 34,
  },

  heroSubtitle: {
    fontFamily: fonts.sans,
    fontSize: 14,
    marginTop: 6,
    marginBottom: 18,
  },

  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: fonts.sans,
    fontSize: 15,
  },

  suggestionBox: {
    marginTop: 16,
    marginHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
  },

  suggestionRow: {
    padding: 14,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  suggestionName: {
    fontFamily: fonts.sansSemi,
    fontSize: 15,
  },

  suggestionSub: {
    fontFamily: fonts.sans,
    fontSize: 12,
    marginTop: 2,
  },

  emptyState: {
    marginTop: 80,
    alignItems: "center",
    paddingHorizontal: 24,
  },

  emptyTitle: {
    marginTop: 14,
    fontFamily: fonts.sansSemi,
    fontSize: 18,
  },

  emptyText: {
    marginTop: 8,
    fontFamily: fonts.sans,
    textAlign: "center",
  },

  speciesHeader: {
    marginTop: 22,
    marginBottom: 14,
    paddingHorizontal: 18,
  },

  speciesName: {
    fontFamily: fonts.sansSemi,
    fontSize: 24,
  },

  speciesMeta: {
    fontFamily: fonts.sans,
    fontSize: 13,
    marginTop: 3,
  },

  card: {
    borderRadius: 22,
    padding: 16,
    marginHorizontal: 18,
    marginBottom: 16,
    borderLeftWidth: 4,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  cardTitle: {
    fontFamily: fonts.sansSemi,
    fontSize: 17,
    marginLeft: 6,
  },

  cardBody: {
    gap: 10,
  },

  cardText: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 20,
  },

  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  chip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },

  chipText: {
    fontFamily: fonts.sansSemi,
    fontSize: 12,
  },
});
