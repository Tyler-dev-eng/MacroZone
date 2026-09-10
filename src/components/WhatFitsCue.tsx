import { type Meal } from "@/storage/meals";
import { type SavedMeal } from "@/storage/savedMeals";
import { type Targets } from "@/storage/targets";
import { colors } from "@/styles/global";
import { withAlpha } from "@/utils/color";
import { getWhatFits } from "@/utils/whatFits";
import { sumMealMacros } from "@/utils/zone";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

type WhatFitsCueProps = {
  meals: Meal[];
  targets: Targets;
  favorites: SavedMeal[];
  recents?: Meal[];
};

export default function WhatFitsCue({
  meals,
  targets,
  favorites,
  recents = [],
}: WhatFitsCueProps) {
  const cue = useMemo(() => {
    const totals = sumMealMacros(meals);
    const owned = [...favorites, ...recents];
    return getWhatFits(totals, targets, owned);
  }, [meals, targets, favorites, recents]);

  if (!cue) return null;

  return (
    <View
      style={styles.shadow}
      accessibilityRole="text"
      accessibilityLabel={cue.line}
    >
      <View style={styles.card}>
        <View pointerEvents="none" style={styles.blob} />
        <View style={styles.iconWrap}>
          <Ionicons name="bulb" size={16} color={colors.primary} />
        </View>
        <View style={styles.text}>
          <Text style={styles.label}>What fits</Text>
          <Text style={styles.line}>{cue.line}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    marginTop: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 6,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    overflow: "hidden",
    borderWidth: 1,
    backgroundColor: withAlpha(colors.primary, 0.12),
    borderColor: withAlpha(colors.primary, 0.32),
  },
  blob: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    opacity: 0.18,
    backgroundColor: colors.primary,
    top: -36,
    right: -20,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: withAlpha(colors.primary, 0.28),
  },
  text: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  line: {
    marginTop: 4,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "600",
    color: colors.text,
  },
});
