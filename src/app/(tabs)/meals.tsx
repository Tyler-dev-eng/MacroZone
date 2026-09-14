import { useDialog } from "@/components/AppDialog";
import KeyboardScrollView from "@/components/KeyboardScrollView";
import MealItem from "@/components/MealItem";
import MealsEmpty from "@/components/MealsEmpty";
import MealsFilters from "@/components/MealsFilters";
import {
  deleteAllMeals,
  deleteMeal,
  getMeals,
  logMealAgain,
  Meal,
} from "@/storage/meals";
import {
  getSavedMeals,
  mealFingerprint,
  toggleFavorite,
} from "@/storage/savedMeals";
import { colors, globalStyles } from "@/styles/global";
import {
  daysAgo,
  formatHistoryDay,
  matchesDatePreset,
  type DatePreset,
} from "@/utils/dates";
import { useResetScrollOnFocus } from "@/hooks/useResetScrollOnFocus";
import { mealTypeLabel } from "@/utils/mealType";
import { useFocusEffect, router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function MealsScreen() {
  const dialog = useDialog();
  const scrollRef = useResetScrollOnFocus();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [ready, setReady] = useState(false);
  const [favoriteKeys, setFavoriteKeys] = useState<Set<string>>(new Set());
  const [loggingId, setLoggingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [preset, setPreset] = useState<DatePreset>("all");
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);

  const loadMeals = async () => {
    const [data, saved] = await Promise.all([getMeals(), getSavedMeals()]);
    setMeals(data);
    setFavoriteKeys(new Set(saved.map(mealFingerprint)));
    setReady(true);
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
      dialog.notice("Couldn't log", "Something went wrong. Try again.");
    } finally {
      setLoggingId(null);
    }
  };

  const handleToggleFavorite = async (meal: Meal) => {
    try {
      await toggleFavorite(meal);
      await loadMeals();
    } catch {
      dialog.notice(
        "Couldn't update favorite",
        "Something went wrong. Try again.",
      );
    }
  };

  const handleClearAll = async () => {
    await deleteAllMeals();
    await loadMeals();
  };

  const confirmClear = () => {
    dialog.confirm({
      title: "Delete all meal history?",
      message:
        "This removes every logged meal, including past days. This can't be undone.",
      confirmLabel: "Delete all",
      destructive: true,
      onConfirm: () => void handleClearAll(),
    });
  };

  const handlePresetChange = (next: DatePreset) => {
    setPreset(next);
    if (next === "custom") {
      setFrom((current) => current ?? daysAgo(6));
      setTo((current) => current ?? new Date());
    }
  };

  const handleFromChange = (date: Date) => {
    setFrom(date);
    setTo((current) => (current && date > current ? date : current));
  };

  const handleToChange = (date: Date) => {
    setTo(date);
    setFrom((current) => (current && date < current ? date : current));
  };

  const clearFilters = () => {
    setQuery("");
    setPreset("all");
    setFrom(null);
    setTo(null);
  };

  const hasActiveFilters = query.trim().length > 0 || preset !== "all";

  const filteredMeals = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return meals.filter((meal) => {
      if (needle) {
        const haystack =
          `${meal.name} ${meal.description ?? ""} ${mealTypeLabel(meal.mealType)}`.toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return matchesDatePreset(meal.createdAt, preset, from, to);
    });
  }, [meals, query, preset, from, to]);

  useFocusEffect(
    useCallback(() => {
      void loadMeals();
    }, []),
  );

  return (
    <KeyboardScrollView ref={scrollRef} style={globalStyles.container}>
      <View style={globalStyles.header}>
        <Text style={globalStyles.title}>All Meals</Text>
        {meals.length > 0 ? (
          <TouchableOpacity onPress={confirmClear} hitSlop={8}>
            <Text style={styles.clear}>Delete all</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {meals.length > 0 ? (
        <MealsFilters
          query={query}
          onQueryChange={setQuery}
          preset={preset}
          onPresetChange={handlePresetChange}
          from={from}
          to={to}
          onFromChange={handleFromChange}
          onToChange={handleToChange}
          onClear={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      ) : null}

      <View style={styles.list}>
        {hasActiveFilters && meals.length > 0 && filteredMeals.length > 0 ? (
          <Text style={styles.count}>
            {filteredMeals.length}{" "}
            {filteredMeals.length === 1 ? "meal" : "meals"}
          </Text>
        ) : null}
        {!ready ? (
          <Text style={globalStyles.empty}>Loading...</Text>
        ) : filteredMeals.length === 0 ? (
          meals.length === 0 ? (
            <MealsEmpty kind="history" />
          ) : (
            <MealsEmpty
              kind="filters"
              query={query}
              preset={preset}
              from={from}
              to={to}
              onClear={clearFilters}
            />
          )
        ) : (
          filteredMeals.map((meal, index) => {
            const dayLabel = formatHistoryDay(meal.createdAt);
            const previousLabel =
              index > 0
                ? formatHistoryDay(filteredMeals[index - 1].createdAt)
                : null;
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
                  description={meal.description}
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
                  isFavorite={favoriteKeys.has(mealFingerprint(meal))}
                  onToggleFavorite={() => handleToggleFavorite(meal)}
                  onDelete={() => handleDeleteMeal(meal.id)}
                />
              </View>
            );
          })
        )}
      </View>
    </KeyboardScrollView>
  );
}

const styles = StyleSheet.create({
  clear: {
    color: colors.alert,
    fontSize: 14,
  },
  list: {
    marginTop: 20,
  },
  count: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 12,
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
