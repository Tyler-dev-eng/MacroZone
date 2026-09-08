import MealItem from "@/components/MealItem";
import { type Meal } from "@/storage/meals";
import { globalStyles } from "@/styles/global";
import { router } from "expo-router";
import { Text, View } from "react-native";

export default function RecentMeals({
  meals,
  title = "Today's meals",
  empty = "No meals logged today.",
  onLogAgain,
  onDeleteMeal,
}: {
  meals: Meal[];
  title?: string;
  empty?: string;
  onLogAgain: (id: string) => void;
  onDeleteMeal?: (id: string) => void;
}) {
  return (
    <View style={{ marginTop: 30 }}>
      <Text style={globalStyles.sectionTitle}>{title}</Text>
      {meals.length === 0 ? (
        <Text style={globalStyles.empty}>{empty}</Text>
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
            mealType={meal.mealType}
            createdAt={meal.createdAt}
            onPress={() =>
              router.push({
                pathname: "/meal/[id]",
                params: { id: meal.id },
              })
            }
            onLogAgain={() => onLogAgain(meal.id)}
            onDelete={onDeleteMeal ? () => onDeleteMeal(meal.id) : undefined}
          />
        ))
      )}
    </View>
  );
}
