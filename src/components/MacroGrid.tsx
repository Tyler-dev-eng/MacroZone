import { Meal } from "@/storage/meals";
import { type Targets } from "@/storage/targets";
import { StyleSheet, View } from "react-native";
import MacroCard from "./MacroCard";

type MacroGridProps = {
  meals: Meal[];
  targets: Targets;
};

export default function MacroGrid({ meals, targets }: MacroGridProps) {
  const totals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fat: acc.fat + meal.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  return (
    <View style={styles.grid}>
      <MacroCard
        label="Calories"
        current={totals.calories}
        target={targets.calories}
        color="#ff6b6b"
        icon="flame"
      />
      <MacroCard
        label="Protein"
        current={totals.protein}
        target={targets.protein}
        unit="g"
        color="#4ecdc4"
        icon="barbell"
      />
      <MacroCard
        label="Carbs"
        current={totals.carbs}
        target={targets.carbs}
        unit="g"
        color="#ffd93d"
        icon="nutrition"
      />
      <MacroCard
        label="Fat"
        current={totals.fat}
        target={targets.fat}
        unit="g"
        color="#6bcb77"
        icon="water"
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
