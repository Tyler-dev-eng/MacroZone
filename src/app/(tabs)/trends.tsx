import TrendChart from "@/components/TrendChart";
import { getMeals, type Meal } from "@/storage/meals";
import { DEFAULT_TARGETS, getTargets, type Targets } from "@/storage/targets";
import { colors, globalStyles } from "@/styles/global";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";

export default function TrendsScreen() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [targets, setTargets] = useState<Targets>(DEFAULT_TARGETS);

  const loadTrends = async () => {
    const [fetchedMeals, fetchedTargets] = await Promise.all([
      getMeals(),
      getTargets(),
    ]);
    setMeals(fetchedMeals);
    setTargets(fetchedTargets);
  };

  useFocusEffect(
    useCallback(() => {
      void loadTrends();
    }, []),
  );

  return (
    <ScrollView
      style={globalStyles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={globalStyles.title}>Trends</Text>
      <Text style={styles.subtitle}>Daily totals vs your targets</Text>
      <TrendChart meals={meals} targets={targets} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
    marginBottom: 20,
  },
});
