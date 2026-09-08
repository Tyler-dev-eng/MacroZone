import MealItem from "@/components/MealItem";
import { deleteAllMeals, deleteMeal, getMeals, Meal } from "@/storage/meals";
import { colors, globalStyles } from "@/styles/global";
import { useFocusEffect, router } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function MealsScreen() {
  const [meals, setMeals] = useState<Meal[]>([]);

  const loadMeals = async () => {
    const data = await getMeals();
    setMeals(data);
  };

  const handleDeleteMeal = async (id: string) => {
    await deleteMeal(id);
    await loadMeals();
  };

  const handleClearAll = async () => {
    await deleteAllMeals();
    await loadMeals();
  };

  const confirmClear = () => {
    Alert.alert("Clear all meals?", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear all", style: "destructive", onPress: handleClearAll },
    ]);
  };

  useFocusEffect(
    useCallback(() => {
      loadMeals();
    }, []),
  );

  return (
    <ScrollView style={globalStyles.container}>
      <View style={globalStyles.header}>
        <Text style={globalStyles.title}>All Meals</Text>
        {meals.length > 0 ? (
          <TouchableOpacity onPress={confirmClear} hitSlop={8}>
            <Text style={{ color: colors.alert, fontSize: 14 }}>Clear all</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={{ marginTop: 30 }}>
        {meals.length === 0 ? (
          <Text style={globalStyles.empty}>No meals logged yet.</Text>
        ) : (
          meals.map((meal) => (
            <MealItem
              key={meal.id}
              name={meal.name}
              calories={meal.calories}
              protein={meal.protein}
              carbs={meal.carbs}
              fat={meal.fat}
              onPress={() =>
                router.push({
                  pathname: "/meal/[id]",
                  params: { id: meal.id },
                })
              }
              onDelete={() => handleDeleteMeal(meal.id)}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}
