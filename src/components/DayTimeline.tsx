import { type Meal } from "@/storage/meals";
import { mealFingerprint } from "@/storage/savedMeals";
import { colors, globalStyles } from "@/styles/global";
import { withAlpha } from "@/utils/color";
import {
  formatLoggedAtTime,
  groupMealsByType,
  MEAL_TYPE_META,
  MEAL_TYPES,
  mealTypeLabel,
  normalizeMealType,
  type MealType,
} from "@/utils/mealType";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const PHOTO_SIZE = 68;

type DayTimelineProps = {
  meals: Meal[];
  favoriteKeys: Set<string>;
  onLogAgain: (id: string) => void;
  onToggleFavorite: (meal: Meal) => void;
  onDeleteMeal: (id: string) => void;
};

export default function DayTimeline({
  meals,
  favoriteKeys,
  onLogAgain,
  onToggleFavorite,
  onDeleteMeal,
}: DayTimelineProps) {
  const groups = useMemo(() => {
    const byType = groupMealsByType(meals);
    for (const type of MEAL_TYPES) {
      byType[type] = [...byType[type]].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    }
    return byType;
  }, [meals]);

  const latestType = useMemo(() => {
    if (meals.length === 0) return null;
    const latest = meals.reduce((best, meal) =>
      new Date(meal.createdAt) > new Date(best.createdAt) ? meal : best,
    );
    return normalizeMealType(latest.mealType);
  }, [meals]);

  const [selectedType, setSelectedType] = useState<MealType | null>(null);
  const activeType =
    selectedType && groups[selectedType].length > 0 ? selectedType : latestType;
  const selectedMeals = activeType ? groups[activeType] : [];

  const openAdd = (type: MealType) => {
    router.navigate({
      pathname: "/add-meals",
      params: { type },
    });
  };

  const openMeal = (id: string) => {
    router.push({
      pathname: "/meal/[id]",
      params: { id },
    });
  };

  return (
    <View style={styles.section}>
      <Text style={globalStyles.sectionTitle}>Today</Text>
      <View style={styles.strip}>
        <View style={styles.lineWrap} pointerEvents="none">
          <View style={styles.lineInner}>
            {MEAL_TYPES.slice(0, -1).map((type) => {
              const filled = groups[type].length > 0;
              return (
                <View
                  key={type}
                  style={[
                    styles.segment,
                    {
                      backgroundColor: filled
                        ? MEAL_TYPE_META[type].color
                        : "rgba(255, 255, 255, 0.12)",
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>

        <View style={styles.nodes}>
          {MEAL_TYPES.map((type) => {
            const slotMeals = groups[type];
            const meta = MEAL_TYPE_META[type];
            const filled = slotMeals.length > 0;
            const selected = activeType === type;
            const cover =
              slotMeals.find((meal) => meal.imageUri) ?? slotMeals[0];
            const calories = slotMeals.reduce(
              (sum, meal) => sum + meal.calories,
              0,
            );
            const time = slotMeals[0]?.createdAt;
            const label = mealTypeLabel(type);

            return (
              <TouchableOpacity
                key={type}
                style={styles.node}
                onPress={() => {
                  if (!filled) {
                    openAdd(type);
                    return;
                  }
                  setSelectedType(type);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={
                  filled
                    ? `${label}, ${slotMeals.length} meal${slotMeals.length === 1 ? "" : "s"}, ${Math.round(calories)} calories`
                    : `${label} not logged. Add ${label.toLowerCase()}`
                }
              >
                <View style={styles.photoWrap}>
                  <View
                    style={[
                      styles.photoRing,
                      {
                        borderColor: filled
                          ? meta.color
                          : "rgba(255, 255, 255, 0.18)",
                        backgroundColor: filled
                          ? withAlpha(meta.color, 0.2)
                          : colors.surface,
                        shadowColor:
                          selected && filled ? meta.color : "transparent",
                      },
                      selected && filled && styles.photoRingSelected,
                    ]}
                  >
                    {cover?.imageUri ? (
                      <Image
                        source={{ uri: cover.imageUri }}
                        style={styles.photo}
                        contentFit="cover"
                      />
                    ) : (
                      <Ionicons
                        name={filled ? meta.icon : "add"}
                        size={filled ? 22 : 20}
                        color={filled ? meta.color : colors.textSecondary}
                      />
                    )}
                  </View>
                  {slotMeals.length > 1 ? (
                    <View
                      style={[
                        styles.countBadge,
                        { backgroundColor: meta.color },
                      ]}
                    >
                      <Text style={styles.countText}>{slotMeals.length}</Text>
                    </View>
                  ) : null}
                </View>
                <Text
                  style={[
                    styles.nodeLabel,
                    { color: filled ? meta.color : colors.textSecondary },
                  ]}
                  numberOfLines={1}
                >
                  {label}
                </Text>
                <Text style={styles.nodeMeta} numberOfLines={1}>
                  {filled ? `${Math.round(calories)} cal` : "Add"}
                </Text>
                {time ? (
                  <Text style={styles.nodeTime} numberOfLines={1}>
                    {formatLoggedAtTime(time)}
                  </Text>
                ) : (
                  <Text style={styles.nodeTime}> </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {activeType && selectedMeals.length > 0 ? (
        <View style={styles.slotMeals}>
          {selectedMeals.map((meal) => (
            <TimelineMealCard
              key={meal.id}
              meal={meal}
              isFavorite={favoriteKeys.has(mealFingerprint(meal))}
              onPress={() => openMeal(meal.id)}
              onLogAgain={() => onLogAgain(meal.id)}
              onToggleFavorite={() => onToggleFavorite(meal)}
              onDelete={() => onDeleteMeal(meal.id)}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function TimelineMealCard({
  meal,
  isFavorite,
  onPress,
  onLogAgain,
  onToggleFavorite,
  onDelete,
}: {
  meal: Meal;
  isFavorite: boolean;
  onPress: () => void;
  onLogAgain: () => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
}) {
  const type = normalizeMealType(meal.mealType);
  const meta = MEAL_TYPE_META[type];

  const confirmDelete = () => {
    Alert.alert("Delete meal?", `"${meal.name}" will be removed.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: onDelete },
    ]);
  };

  return (
    <View style={[styles.cardShadow, { shadowColor: meta.color }]}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: withAlpha(meta.color, 0.14),
            borderColor: withAlpha(meta.color, 0.38),
          },
        ]}
      >
        <TouchableOpacity
          style={styles.cardBody}
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={`${meal.name}, ${meal.calories} calories`}
        >
          {meal.imageUri ? (
            <Image
              source={{ uri: meal.imageUri }}
              style={styles.cardPhoto}
              contentFit="cover"
              accessibilityLabel={`${meal.name} photo`}
            />
          ) : (
            <View
              style={[
                styles.cardPhoto,
                styles.cardPhotoPlaceholder,
                { backgroundColor: withAlpha(meta.color, 0.28) },
              ]}
            >
              <Ionicons name={meta.icon} size={22} color={meta.color} />
            </View>
          )}
          <View style={styles.cardText}>
            <Text style={styles.cardName} numberOfLines={1}>
              {meal.name}
            </Text>
            <Text style={styles.cardMeta}>
              {formatLoggedAtTime(meal.createdAt)}
            </Text>
            <Text style={styles.cardMacros} numberOfLines={1}>
              {meal.calories} cal · {meal.protein}g P · {meal.carbs}g C ·{" "}
              {meal.fat}g F
            </Text>
          </View>
        </TouchableOpacity>
        <View style={styles.cardActions}>
          <TouchableOpacity
            onPress={onToggleFavorite}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={
              isFavorite
                ? `Remove ${meal.name} from favorites`
                : `Save ${meal.name} as favorite`
            }
          >
            <Ionicons
              name={isFavorite ? "star" : "star-outline"}
              size={20}
              color={isFavorite ? colors.primary : colors.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onLogAgain}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Log ${meal.name} again`}
          >
            <Ionicons name="copy-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={confirmDelete}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${meal.name}`}
          >
            <Ionicons name="trash-outline" size={20} color={colors.alert} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 8,
  },
  strip: {
    position: "relative",
    paddingTop: 4,
  },
  lineWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 4 + PHOTO_SIZE / 2 - 1.5,
    height: 3,
  },
  lineInner: {
    marginHorizontal: "12.5%",
    flex: 1,
    flexDirection: "row",
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
    gap: 0,
  },
  segment: {
    flex: 1,
    height: 3,
  },
  nodes: {
    flexDirection: "row",
  },
  node: {
    flex: 1,
    alignItems: "center",
    minHeight: 44,
  },
  photoWrap: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
  },
  photoRing: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: PHOTO_SIZE / 2,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  photoRingSelected: {
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
  photo: {
    position: "absolute",
    width: PHOTO_SIZE - 6,
    height: PHOTO_SIZE - 6,
    borderRadius: (PHOTO_SIZE - 6) / 2,
  },
  countBadge: {
    position: "absolute",
    right: -2,
    top: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.background,
  },
  countText: {
    color: colors.background,
    fontSize: 11,
    fontWeight: "800",
  },
  nodeLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "800",
  },
  nodeMeta: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "700",
    color: colors.text,
  },
  nodeTime: {
    marginTop: 1,
    fontSize: 11,
    color: colors.textSecondary,
  },
  slotMeals: {
    marginTop: 16,
    gap: 10,
  },
  cardShadow: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardBody: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 44,
  },
  cardPhoto: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  cardPhotoPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  cardMeta: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textSecondary,
  },
  cardMacros: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary,
  },
  cardActions: {
    gap: 12,
    alignItems: "center",
  },
});
