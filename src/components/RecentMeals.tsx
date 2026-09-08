import MealItem from "@/components/MealItem";
import { type Meal } from "@/storage/meals";
import { globalStyles } from "@/styles/global";
import { router } from "expo-router";
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
      <Text style={globalStyles.sectionTitle}>{"Today's meals"}</Text>
      {meals.length === 0 ? (
        <Text style={globalStyles.empty}>No meals logged today.</Text>
      ) : (
        meals.map((meal) => (
          <MealItem
            key={meal.id}
            name={meal.name}
            calories={meal.calories}
            protein={meal.protein}
            carbs={meal.carbs}
            fat={meal.fat}
            imageUri={meal.imageUri}
            onPress={() =>
              router.push({
                pathname: "/meal/[id]",
                params: { id: meal.id },
              })
            }
            onDelete={() => onDeleteMeal(meal.id)}
          />
        ))
      )}
    </View>
  );
}
