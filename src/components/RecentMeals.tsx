import MealItem from "@/components/MealItem";
import { getMeals, type Meal } from "@/storage/meals";
import { globalStyles } from "@/styles/global";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Text, View } from "react-native";

export default function RecentMeals() {
  const [meals, setMeals] = useState<Meal[]>([]);

  // Refetch whenever this screen is focused (e.g. after adding a meal on another tab).
  // useEffect would only run once on mount, so new rows wouldn't show until reload.
  useFocusEffect(
    useCallback(() => {
      void getMeals().then(setMeals);
    }, []),
  );

  return (
    <View style={{ marginTop: 30 }}>
      <Text style={globalStyles.sectionTitle}>Recent Meals</Text>
      {meals.length === 0 ? (
        <Text style={globalStyles.empty}>No meals yet</Text>
      ) : (
        meals
          .slice(0, 5) // newest 5; getMeals() already orders by createdAt DESC
          .map((meal) => (
            <MealItem
              key={meal.id}
              name={meal.name}
              calories={meal.calories}
              protein={meal.protein}
              carbs={meal.carbs}
              fat={meal.fat}
            />
          ))
      )}
    </View>
  );
}
