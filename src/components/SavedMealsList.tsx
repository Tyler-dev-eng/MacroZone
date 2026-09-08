import { type SavedMeal } from "@/storage/savedMeals";
import { colors, globalStyles } from "@/styles/global";
import { mealTypeLabel } from "@/utils/mealType";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type SavedMealsListProps = {
  meals: SavedMeal[];
  title?: string;
  hint?: string;
  onPress: (meal: SavedMeal) => void;
  onRemove: (id: string) => void;
};

export default function SavedMealsList({
  meals,
  title = "Favorites",
  hint,
  onPress,
  onRemove,
}: SavedMealsListProps) {
  if (meals.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={globalStyles.sectionTitle}>{title}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      {meals.map((meal) => (
        <View key={meal.id} style={styles.row}>
          <TouchableOpacity
            style={styles.details}
            onPress={() => onPress(meal)}
            accessibilityRole="button"
            accessibilityLabel={`${meal.name}, ${meal.calories} calories`}
          >
            {meal.imageUri ? (
              <Image
                source={{ uri: meal.imageUri }}
                style={styles.thumb}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.thumb, styles.thumbPlaceholder]}>
                <Ionicons name="star" size={16} color={colors.primary} />
              </View>
            )}
            <View style={styles.text}>
              <Text style={styles.name}>{meal.name}</Text>
              <Text style={styles.meta}>
                {mealTypeLabel(meal.mealType)} · {meal.calories} cal ·{" "}
                {meal.protein}g P · {meal.carbs}g C · {meal.fat}g F
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onRemove(meal.id)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${meal.name} from favorites`}
          >
            <Ionicons name="star" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 8,
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: -8,
    marginBottom: 10,
  },
  row: {
    backgroundColor: "#16213e",
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  details: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  thumbPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  meta: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
