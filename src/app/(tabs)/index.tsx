import HomeHeader from "@/components/HomeHeader";
import MacroGrid from "@/components/MacroGrid";
import RecentMeals from "@/components/RecentMeals";
import {
  deleteMeal,
  getMeals,
  getMealsForDay,
  logMealAgain,
  Meal,
} from "@/storage/meals";
import { DEFAULT_TARGETS, getTargets, type Targets } from "@/storage/targets";
import { globalStyles } from "@/styles/global";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, ScrollView, Text } from "react-native";

export default function HomeScreen() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [recentPastMeals, setRecentPastMeals] = useState<Meal[]>([]);
  const [targets, setTargets] = useState<Targets>(DEFAULT_TARGETS);
  const [loggingId, setLoggingId] = useState<string | null>(null);

  const fetchHomeData = async () => {
    const [fetchedMeals, allMeals, fetchedTargets] = await Promise.all([
      getMealsForDay(),
      getMeals(),
      getTargets(),
    ]);
    const todayIds = new Set(fetchedMeals.map((meal) => meal.id));
    setMeals(fetchedMeals);
    setRecentPastMeals(
      allMeals.filter((meal) => !todayIds.has(meal.id)).slice(0, 5),
    );
    setTargets(fetchedTargets);
  };

  const handleDeleteMeal = async (id: string) => {
    await deleteMeal(id);
    await fetchHomeData();
  };

  const handleLogAgain = async (id: string) => {
    if (loggingId) return;

    setLoggingId(id);
    try {
      await logMealAgain(id);
      await fetchHomeData();
    } catch {
      Alert.alert("Couldn't log", "Something went wrong. Try again.");
    } finally {
      setLoggingId(null);
    }
  };

  useFocusEffect(
    useCallback(() => {
      void fetchHomeData();
    }, []),
  );

  return (
    <ScrollView style={globalStyles.container}>
      <Text style={globalStyles.title}>MacroZone</Text>
      <HomeHeader />
      <MacroGrid meals={meals} targets={targets} />
      <RecentMeals
        meals={meals}
        onLogAgain={handleLogAgain}
        onDeleteMeal={handleDeleteMeal}
      />
      {recentPastMeals.length > 0 ? (
        <RecentMeals
          title="Log again"
          meals={recentPastMeals}
          onLogAgain={handleLogAgain}
        />
      ) : null}
    </ScrollView>
  );
}
