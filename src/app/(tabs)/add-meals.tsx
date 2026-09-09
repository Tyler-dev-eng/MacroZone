import KeyboardScrollView from "@/components/KeyboardScrollView";
import LoggedAtField from "@/components/LoggedAtField";
import MealPhotoPicker from "@/components/MealPhotoPicker";
import MealTypePicker from "@/components/MealTypePicker";
import SavedMealsList from "@/components/SavedMealsList";
import { addMeal } from "@/storage/meals";
import {
  deleteSavedMeal,
  getSavedMeals,
  saveMealAsFavorite,
  type SavedMeal,
} from "@/storage/savedMeals";
import { useResetScrollOnFocus } from "@/hooks/useResetScrollOnFocus";
import { colors, globalStyles } from "@/styles/global";
import { defaultMealType, isMealType, type MealType } from "@/utils/mealType";
import { useFocusEffect, router, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const toNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export default function AddMealScreen() {
  const scrollRef = useResetScrollOnFocus();
  const params = useLocalSearchParams<{ type?: string | string[] }>();
  const typeParam = Array.isArray(params.type) ? params.type[0] : params.type;
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [mealType, setMealType] = useState<MealType>(defaultMealType);
  const [loggedAt, setLoggedAt] = useState(() => new Date());
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]);
  const [saveAsFavorite, setSaveAsFavorite] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadSavedMeals = async () => {
    const saved = await getSavedMeals();
    setSavedMeals(saved);
  };

  useFocusEffect(
    useCallback(() => {
      if (typeParam && isMealType(typeParam)) {
        setMealType(typeParam);
        router.setParams({ type: undefined });
      }
      void loadSavedMeals();
    }, [typeParam]),
  );

  const applySavedMeal = (saved: SavedMeal) => {
    setName(saved.name);
    setCalories(String(saved.calories));
    setProtein(String(saved.protein));
    setCarbs(String(saved.carbs));
    setFat(String(saved.fat));
    setImageUri(saved.imageUri);
    setMealType(
      isMealType(saved.mealType) ? saved.mealType : defaultMealType(),
    );
    setLoggedAt(new Date());
    setSaveAsFavorite(false);
  };

  const handleRemoveSaved = async (id: string) => {
    try {
      await deleteSavedMeal(id);
      await loadSavedMeals();
    } catch {
      Alert.alert(
        "Couldn't update favorite",
        "Something went wrong. Try again.",
      );
    }
  };

  const handleAddMeal = async () => {
    if (saving) return;

    const trimmedName = name.trim();
    const parsedCalories = toNumber(calories);

    if (!trimmedName || parsedCalories === null) {
      Alert.alert("Missing info", "Please enter a meal name and calories.");
      return;
    }

    setSaving(true);
    try {
      const created = await addMeal({
        name: trimmedName,
        calories: Math.round(parsedCalories),
        protein: toNumber(protein) ?? 0,
        carbs: toNumber(carbs) ?? 0,
        fat: toNumber(fat) ?? 0,
        imageUri,
        mealType,
        createdAt: loggedAt.toISOString(),
      });
      if (saveAsFavorite) {
        await saveMealAsFavorite(created);
      }
    } catch {
      Alert.alert("Couldn't save", "Something went wrong. Try again.");
      return;
    } finally {
      setSaving(false);
    }

    // Tabs stay mounted, so clear the form for the next visit.
    setName("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFat("");
    setImageUri(null);
    const now = new Date();
    setMealType(defaultMealType(now));
    setLoggedAt(now);
    setSaveAsFavorite(false);

    // Switch to the Home tab (push would stack another Home on this tab).
    router.navigate("/");
  };

  return (
    <KeyboardScrollView
      ref={scrollRef}
      style={globalStyles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={globalStyles.title}>Add Meal</Text>

      <SavedMealsList
        meals={savedMeals}
        hint="Tap to fill the form"
        onPress={applySavedMeal}
        onRemove={handleRemoveSaved}
      />

      <MealPhotoPicker uri={imageUri} onChange={setImageUri} />

      <MealTypePicker value={mealType} onChange={setMealType} />
      <LoggedAtField value={loggedAt} onChange={setLoggedAt} />

      <TextInput
        style={styles.input}
        placeholder="Meal name"
        placeholderTextColor={colors.textSecondary}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Calories"
        placeholderTextColor={colors.textSecondary}
        keyboardType="numeric"
        value={calories}
        onChangeText={setCalories}
      />

      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.rowInput]}
          placeholder="Protein (g)"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
          value={protein}
          onChangeText={setProtein}
        />
        <TextInput
          style={[styles.input, styles.rowInput]}
          placeholder="Carbs (g)"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
          value={carbs}
          onChangeText={setCarbs}
        />
        <TextInput
          style={[styles.input, styles.rowInput]}
          placeholder="Fat (g)"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
          value={fat}
          onChangeText={setFat}
        />
      </View>

      <TouchableOpacity
        style={styles.favoriteToggle}
        onPress={() => setSaveAsFavorite((prev) => !prev)}
        accessibilityRole="button"
        accessibilityState={{ selected: saveAsFavorite }}
        accessibilityLabel="Save as favorite"
      >
        <Text style={styles.favoriteToggleText}>
          {saveAsFavorite ? "★  Will save as favorite" : "☆  Save as favorite"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={handleAddMeal}
        disabled={saving}
      >
        <Text style={styles.buttonText}>
          {saving ? "Adding..." : "Add Meal"}
        </Text>
      </TouchableOpacity>
    </KeyboardScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    padding: 16,
    borderRadius: 10,
    fontSize: 16,
    marginTop: 16,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  rowInput: {
    flex: 1,
  },
  favoriteToggle: {
    marginTop: 20,
    alignItems: "center",
  },
  favoriteToggleText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  button: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 24,
  },
  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "bold",
  },
});
