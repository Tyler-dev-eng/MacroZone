import HomeHeader from "@/components/HomeHeader";
import MacroGrid from "@/components/MacroGrid";
import RecentMeals from "@/components/RecentMeals";
import { getMeals, Meal } from "@/storage/meals";
import { globalStyles } from "@/styles/global";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, Text } from "react-native";

export default function HomeScreen() {
  const [meals, setMeals] = useState<Meal[]>([]);

  const fetchMeals = async () => {
    const fetchedMeals = await getMeals();
    setMeals(fetchedMeals);
  };

  useFocusEffect(
    useCallback(() => {
      fetchMeals();
    }, []),
  );

  return (
    <ScrollView style={globalStyles.container}>
      <Text style={globalStyles.title}>MacroZone</Text>
      <HomeHeader />
      <MacroGrid meals={meals} />
      <RecentMeals meals={meals} />
    </ScrollView>
  );
}
