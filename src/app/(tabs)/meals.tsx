import MealItem from "@/components/MealItem";
import {
  deleteAllMeals,
  deleteMeal,
  getMeals,
  logMealAgain,
  Meal,
} from "@/storage/meals";
import { colors, globalStyles } from "@/styles/global";
import { formatHistoryDay } from "@/utils/dates";
import { useFocusEffect, router } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function MealsScreen() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loggingId, setLoggingId] = useState<string | null>(null);

  const loadMeals = async () => {
    const data = await getMeals();
    setMeals(data);
  };

  const handleDeleteMeal = async (id: string) => {
    await deleteMeal(id);
    await loadMeals();
  };

  const handleLogAgain = async (id: string) => {
    if (loggingId) return;

    setLoggingId(id);
    try {
      await logMealAgain(id);
      await loadMeals();
    } catch {
      Alert.alert("Couldn't log", "Something went wrong. Try again.");
    } finally {
      setLoggingId(null);
    }
  };

  const handleClearAll = async () => {
    await deleteAllMeals();
    await loadMeals();
  };

  const confirmClear = () => {
    Alert.alert(
      "Delete all meal history?",
      "This removes every logged meal, including past days. This can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete all", style: "destructive", onPress: handleClearAll },
      ],
    );
  };

  useFocusEffect(
    useCallback(() => {
      void loadMeals();
    }, []),
  );

  return (
    <ScrollView style={globalStyles.container}>
      <View style={globalStyles.header}>
        <Text style={globalStyles.title}>All Meals</Text>
        {meals.length > 0 ? (
          <TouchableOpacity onPress={confirmClear} hitSlop={8}>
            <Text style={styles.clear}>Delete all</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={styles.list}>
        {meals.length === 0 ? (
          <Text style={globalStyles.empty}>No meals logged yet.</Text>
        ) : (
          meals.map((meal, index) => {
            const dayLabel = formatHistoryDay(meal.createdAt);
            const previousLabel =
              index > 0 ? formatHistoryDay(meals[index - 1].createdAt) : null;
            const showDay = dayLabel !== previousLabel;

            return (
              <View key={meal.id}>
                {showDay ? (
                  <Text
                    style={[styles.day, index === 0 ? styles.firstDay : null]}
                  >
                    {dayLabel}
                  </Text>
                ) : null}
                <MealItem
                  name={meal.name}
                  calories={meal.calories}
                  protein={meal.protein}
                  carbs={meal.carbs}
                  fat={meal.fat}
                  imageUri={meal.imageUri}
                  mealType={meal.mealType}
                  createdAt={meal.createdAt}
                  onPress={() =>
                    router.push({
                      pathname: "/meal/[id]",
                      params: { id: meal.id },
                    })
                  }
                  onLogAgain={() => handleLogAgain(meal.id)}
                  onDelete={() => handleDeleteMeal(meal.id)}
                />
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  clear: {
    color: colors.alert,
    fontSize: 14,
  },
  list: {
    marginTop: 30,
  },
  day: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    marginTop: 18,
    marginBottom: 10,
  },
  firstDay: {
    marginTop: 0,
  },
});
