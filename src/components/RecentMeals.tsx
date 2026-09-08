import MealItem from "@/components/MealItem";
import { type Meal } from "@/storage/meals";
import { globalStyles } from "@/styles/global";
import { Text, View } from "react-native";

export default function RecentMeals({
  meals,
  onDeleteMeal,
}: {
  meals: Meal[];
  onDeleteMeal: (id: string) => void;
}) {
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
              onDelete={() => onDeleteMeal(meal.id)}
            />
          ))
      )}
    </View>
  );
}
