import { type SavedMeal } from "@/storage/savedMeals";
import { colors, globalStyles } from "@/styles/global";
import { withAlpha } from "@/utils/color";
import {
  MEAL_TYPE_META,
  mealTypeLabel,
  normalizeMealType,
} from "@/utils/mealType";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
      <Text style={[globalStyles.sectionTitle, styles.heading]}>{title}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      <ScrollView
        horizontal
        nestedScrollEnabled
        directionalLockEnabled
        keyboardShouldPersistTaps="handled"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.palette}
        style={styles.scroller}
      >
        {meals.map((meal) => {
          const type = normalizeMealType(meal.mealType);
          const meta = MEAL_TYPE_META[type];
          const label = mealTypeLabel(type);
          return (
            <View
              key={meal.id}
              style={[styles.tileShadow, { shadowColor: meta.color }]}
            >
              <View
                style={[
                  styles.tile,
                  {
                    backgroundColor: withAlpha(meta.color, 0.16),
                    borderColor: withAlpha(meta.color, 0.4),
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.pick}
                  onPress={() => onPress(meal)}
                  accessibilityRole="button"
                  accessibilityLabel={`${meal.name}, ${meal.calories} calories. ${label}`}
                >
                  {meal.imageUri ? (
                    <Image
                      source={{ uri: meal.imageUri }}
                      style={styles.photo}
                      contentFit="cover"
                    />
                  ) : (
                    <View
                      style={[
                        styles.photo,
                        styles.photoPlaceholder,
                        { backgroundColor: withAlpha(meta.color, 0.28) },
                      ]}
                    >
                      <Ionicons name={meta.icon} size={28} color={meta.color} />
                    </View>
                  )}
                  <Text style={styles.name} numberOfLines={1}>
                    {meal.name}
                  </Text>
                  <Text style={[styles.calories, { color: meta.color }]}>
                    {meal.calories} cal
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.star}
                  onPress={() => onRemove(meal.id)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${meal.name} from favorites`}
                >
                  <Ionicons name="star" size={14} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const TILE_WIDTH = 124;

const styles = StyleSheet.create({
  section: {
    marginTop: 8,
    marginHorizontal: -20,
  },
  heading: {
    paddingHorizontal: 20,
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: -8,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  scroller: {
    flexGrow: 0,
  },
  palette: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 6,
  },
  tileShadow: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  tile: {
    width: TILE_WIDTH,
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  pick: {
    minHeight: 44,
  },
  photo: {
    width: TILE_WIDTH,
    height: 92,
    backgroundColor: colors.surface,
  },
  photoPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    marginTop: 10,
    marginHorizontal: 10,
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  calories: {
    marginTop: 2,
    marginHorizontal: 10,
    marginBottom: 12,
    fontSize: 12,
    fontWeight: "800",
  },
  star: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
});
