import { Meal } from "@/storage/meals";
import { type Targets } from "@/storage/targets";
import {
  dominantMacroFromMeal,
  isMealOnLocalDay,
  peekQueuedMacroGlow,
  clearQueuedMacroGlow,
} from "@/utils/macroGlow";
import { sumMealMacros } from "@/utils/zone";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import MacroCard from "./MacroCard";

type MacroGridProps = {
  meals: Meal[];
  targets: Targets;
};

const GLOW_MS = 1100;

export default function MacroGrid({ meals, targets }: MacroGridProps) {
  const totals = sumMealMacros(meals);
  const queued = peekQueuedMacroGlow();
  const queuedToday =
    queued != null &&
    isMealOnLocalDay(queued) &&
    meals.some((row) => row.id === queued.id)
      ? queued
      : null;
  const glowKey = queuedToday
    ? dominantMacroFromMeal(queuedToday, targets)
    : null;
  const glowAt = glowKey != null && queuedToday ? Number(queuedToday.id) : 0;

  useEffect(() => {
    if (queuedToday == null) {
      if (queued != null && !isMealOnLocalDay(queued)) {
        clearQueuedMacroGlow();
      }
      return;
    }

    const timeout = setTimeout(clearQueuedMacroGlow, GLOW_MS);
    return () => clearTimeout(timeout);
  }, [queued, queuedToday]);

  return (
    <View style={styles.grid}>
      <MacroCard
        label="Calories"
        current={totals.calories}
        target={targets.calories}
        color="#ff6b6b"
        icon="flame"
        glowAt={glowKey === "calories" ? glowAt : 0}
      />
      <MacroCard
        label="Protein"
        current={totals.protein}
        target={targets.protein}
        unit="g"
        color="#4ecdc4"
        icon="barbell"
        glowAt={glowKey === "protein" ? glowAt : 0}
      />
      <MacroCard
        label="Carbs"
        current={totals.carbs}
        target={targets.carbs}
        unit="g"
        color="#ffd93d"
        icon="nutrition"
        glowAt={glowKey === "carbs" ? glowAt : 0}
      />
      <MacroCard
        label="Fat"
        current={totals.fat}
        target={targets.fat}
        unit="g"
        color="#6bcb77"
        icon="water"
        glowAt={glowKey === "fat" ? glowAt : 0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
});
