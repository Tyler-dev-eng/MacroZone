import HomeHeader from "@/components/HomeHeader";
import MacroGrid from "@/components/MacroGrid";
import RecentMeals from "@/components/RecentMeals";
import { deleteAllMeals, deleteMeal, getMeals, Meal } from "@/storage/meals";
import { DEFAULT_TARGETS, getTargets, type Targets } from "@/storage/targets";
import { globalStyles } from "@/styles/global";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, Text } from "react-native";

export default function HomeScreen() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [targets, setTargets] = useState<Targets>(DEFAULT_TARGETS);

  const fetchHomeData = async () => {
    const [fetchedMeals, fetchedTargets] = await Promise.all([
      getMeals(),
      getTargets(),
    ]);
    setMeals(fetchedMeals);
    setTargets(fetchedTargets);
  };

  const handleDeleteMeal = async (id: string) => {
    await deleteMeal(id);
    await fetchHomeData();
  };

  const handleClearAll = async () => {
    await deleteAllMeals();
    await fetchHomeData();
  };

  useFocusEffect(
    useCallback(() => {
      void fetchHomeData();
    }, []),
  );

  return (
    <ScrollView style={globalStyles.container}>
      <Text style={globalStyles.title}>MacroZone</Text>
      <HomeHeader hasMeals={meals.length > 0} onClearAll={handleClearAll} />
      <MacroGrid meals={meals} targets={targets} />
      <RecentMeals meals={meals} onDeleteMeal={handleDeleteMeal} />
    </ScrollView>
  );
}
