import HomeHeader from "@/components/HomeHeader";
import KeyboardScrollView from "@/components/KeyboardScrollView";
import MacroGrid from "@/components/MacroGrid";
import RecentMeals from "@/components/RecentMeals";
import SavedMealsList from "@/components/SavedMealsList";
import ZoneBanner from "@/components/ZoneBanner";
import {
  deleteMeal,
  getMeals,
  getMealsForDay,
  logMealAgain,
  Meal,
} from "@/storage/meals";
import {
  deleteSavedMeal,
  getSavedMeals,
  logSavedMeal,
  mealFingerprint,
  toggleFavorite,
  type SavedMeal,
} from "@/storage/savedMeals";
import { DEFAULT_TARGETS, getTargets, type Targets } from "@/storage/targets";
import { useResetScrollOnFocus } from "@/hooks/useResetScrollOnFocus";
import { globalStyles } from "@/styles/global";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Text } from "react-native";

export default function HomeScreen() {
  const scrollRef = useResetScrollOnFocus();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [recentPastMeals, setRecentPastMeals] = useState<Meal[]>([]);
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]);
  const [targets, setTargets] = useState<Targets>(DEFAULT_TARGETS);
  const [loggingId, setLoggingId] = useState<string | null>(null);

  const fetchHomeData = async () => {
    const [fetchedMeals, fetchedHistory, fetchedSaved, fetchedTargets] =
      await Promise.all([
        getMealsForDay(),
        getMeals(),
        getSavedMeals(),
        getTargets(),
      ]);
    const todayIds = new Set(fetchedMeals.map((meal) => meal.id));
    setMeals(fetchedMeals);
    setRecentPastMeals(
      fetchedHistory.filter((meal) => !todayIds.has(meal.id)).slice(0, 5),
    );
    setSavedMeals(fetchedSaved);
    setTargets(fetchedTargets);
  };

  const favoriteKeys = new Set(savedMeals.map(mealFingerprint));

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

  const handleLogSaved = async (saved: SavedMeal) => {
    if (loggingId) return;

    setLoggingId(saved.id);
    try {
      await logSavedMeal(saved.id);
      await fetchHomeData();
    } catch {
      Alert.alert("Couldn't log", "Something went wrong. Try again.");
    } finally {
      setLoggingId(null);
    }
  };

  const handleToggleFavorite = async (meal: Meal) => {
    try {
      await toggleFavorite(meal);
      await fetchHomeData();
    } catch {
      Alert.alert(
        "Couldn't update favorite",
        "Something went wrong. Try again.",
      );
    }
  };

  const handleRemoveSaved = async (id: string) => {
    try {
      await deleteSavedMeal(id);
      await fetchHomeData();
    } catch {
      Alert.alert(
        "Couldn't update favorite",
        "Something went wrong. Try again.",
      );
    }
  };

  useFocusEffect(
    useCallback(() => {
      void fetchHomeData();
    }, []),
  );

  return (
    <KeyboardScrollView ref={scrollRef} style={globalStyles.container}>
      <Text style={globalStyles.title}>MacroZone</Text>
      <HomeHeader />
      <ZoneBanner meals={meals} targets={targets} />
      <MacroGrid meals={meals} targets={targets} />
      <SavedMealsList
        meals={savedMeals}
        hint="Tap to log today"
        onPress={handleLogSaved}
        onRemove={handleRemoveSaved}
      />
      <RecentMeals
        meals={meals}
        favoriteKeys={favoriteKeys}
        onLogAgain={handleLogAgain}
        onToggleFavorite={handleToggleFavorite}
        onDeleteMeal={handleDeleteMeal}
      />
      {recentPastMeals.length > 0 ? (
        <RecentMeals
          title="Log again"
          meals={recentPastMeals}
          favoriteKeys={favoriteKeys}
          onLogAgain={handleLogAgain}
          onToggleFavorite={handleToggleFavorite}
        />
      ) : null}
    </KeyboardScrollView>
  );
}
