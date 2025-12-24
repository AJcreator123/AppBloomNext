// src/components/StatusCard.tsx

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type StatusType = "optimal" | "warning" | "critical" | "info";

interface StatusCardProps {
  label: string;
  value: string;
  unit?: string;
  status?: StatusType;

  // ✅ SUPPORT BOTH (icon is what PlantDetailScreen uses)
  icon?: keyof typeof Ionicons.glyphMap;
  iconName?: keyof typeof Ionicons.glyphMap;

  helperText?: string;
}

const statusColors: Record<StatusType, { bg: string; text: string }> = {
  optimal: { bg: "#DCFCE7", text: "#166534" },
  warning: { bg: "#FEF9C3", text: "#854D0E" },
  critical: { bg: "#FEE2E2", text: "#991B1B" },
  info: { bg: "#E0F2FE", text: "#075985" },
};

const StatusCard: React.FC<StatusCardProps> = ({
  label,
  value,
  unit,
  status = "info",
  icon,
  iconName,
  helperText,
}) => {
  const colors = statusColors[status];

  // ✅ RESOLVE ICON CORRECTLY
  const resolvedIcon: keyof typeof Ionicons.glyphMap =
    icon ?? iconName ?? "leaf-outline";

  return (
    <View style={styles.card}>
      {/* HEADER ROW */}
      <View style={styles.row}>
        <View style={styles.labelRow}>
          <View style={styles.iconBadge}>
            <Ionicons
              name={resolvedIcon}
              size={18}
              color="#22C55E"
            />
          </View>
          <Text style={styles.label}>{label}</Text>
        </View>

        {/* STATUS PILL */}
        <View
          style={[
            styles.pill,
            { backgroundColor: colors.bg, borderColor: colors.text },
          ]}
        >
          <View style={styles.pillDot} />
          <Text style={[styles.pillText, { color: colors.text }]}>
            {status === "optimal"
              ? "Optimal"
              : status === "warning"
              ? "Check soon"
              : status === "critical"
              ? "Needs attention"
              : "Monitoring"}
          </Text>
        </View>
      </View>

      {/* SENSOR LABEL */}
      <Text style={styles.sensorLabel}>{label}</Text>

      {/* VALUE */}
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>

      {helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.04)",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 3,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBadge: {
    width: 26,
    height: 26,
    borderRadius: 999,
    backgroundColor: "#ECFDF3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#020617",
  },

  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },

  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#22C55E",
    marginRight: 6,
  },

  pillText: {
    fontSize: 11,
    fontWeight: "600",
  },

  sensorLabel: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },

  valueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 6,
  },

  value: {
    fontSize: 32,
    fontWeight: "700",
    color: "#020617",
  },

  unit: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 6,
    marginBottom: 4,
  },

  helper: {
    marginTop: 6,
    fontSize: 12,
    color: "#6B7280",
  },
});

export default StatusCard;
