import KeyboardScrollView from "@/components/KeyboardScrollView";
import TrendChart from "@/components/TrendChart";
import { getMeals, type Meal } from "@/storage/meals";
import { DEFAULT_TARGETS, getTargets, type Targets } from "@/storage/targets";
import { useResetScrollOnFocus } from "@/hooks/useResetScrollOnFocus";
import { colors, globalStyles } from "@/styles/global";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text } from "react-native";

export default function TrendsScreen() {
  const scrollRef = useResetScrollOnFocus();
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
    <KeyboardScrollView
      ref={scrollRef}
      style={globalStyles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={globalStyles.title}>Trends</Text>
      <Text style={styles.subtitle}>Days in the zone vs your targets</Text>
      <TrendChart meals={meals} targets={targets} />
    </KeyboardScrollView>
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
