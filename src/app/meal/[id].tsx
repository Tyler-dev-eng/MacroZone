import KeyboardScrollView from "@/components/KeyboardScrollView";
import LoggedAtField from "@/components/LoggedAtField";
import MealPhotoPicker from "@/components/MealPhotoPicker";
import MealTypePicker from "@/components/MealTypePicker";
import { getMeal, updateMeal, type Meal } from "@/storage/meals";
import { findSavedMeal, toggleFavorite } from "@/storage/savedMeals";
import { useResetScrollOnFocus } from "@/hooks/useResetScrollOnFocus";
import { colors, globalStyles } from "@/styles/global";
import { defaultMealType, isMealType, type MealType } from "@/utils/mealType";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
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

export default function MealDetailsScreen() {
  const scrollRef = useResetScrollOnFocus();
  const { id } = useLocalSearchParams<{ id: string }>();
  const mealId = Array.isArray(id) ? id[0] : id;

  const [meal, setMeal] = useState<Meal | null>(null);
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [mealType, setMealType] = useState<MealType>(defaultMealType);
  const [loggedAt, setLoggedAt] = useState(() => new Date());
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!mealId) return;

    void getMeal(mealId).then((row) => {
      if (row) {
        setMeal(row);
        setName(row.name);
        setCalories(String(row.calories));
        setProtein(String(row.protein));
        setCarbs(String(row.carbs));
        setFat(String(row.fat));
        setImageUri(row.imageUri);
        setMealType(isMealType(row.mealType) ? row.mealType : "snack");
        setLoggedAt(new Date(row.createdAt));
        void findSavedMeal(row).then((saved) => setIsFavorite(Boolean(saved)));
      }
      setLoading(false);
    });
  }, [mealId]);

  const handleSave = async () => {
    if (!meal || saving) return;

    const trimmedName = name.trim();
    const parsedCalories = toNumber(calories);

    if (!trimmedName || parsedCalories === null) {
      Alert.alert("Missing info", "Please enter a meal name and calories.");
      return;
    }

    setSaving(true);
    try {
      await updateMeal({
        ...meal,
        name: trimmedName,
        calories: Math.round(parsedCalories),
        protein: toNumber(protein) ?? 0,
        carbs: toNumber(carbs) ?? 0,
        fat: toNumber(fat) ?? 0,
        imageUri,
        mealType,
        createdAt: loggedAt.toISOString(),
      });
      router.back();
    } catch {
      Alert.alert("Couldn't save", "Something went wrong. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!meal) return;
    try {
      const next = await toggleFavorite({
        ...meal,
        name: name.trim() || meal.name,
        calories: toNumber(calories) ?? meal.calories,
        protein: toNumber(protein) ?? meal.protein,
        carbs: toNumber(carbs) ?? meal.carbs,
        fat: toNumber(fat) ?? meal.fat,
        imageUri,
        mealType,
      });
      setIsFavorite(next);
    } catch {
      Alert.alert(
        "Couldn't update favorite",
        "Something went wrong. Try again.",
      );
    }
  };

  if (loading) {
    return (
      <View style={globalStyles.container}>
        <Text style={globalStyles.empty}>Loading...</Text>
      </View>
    );
  }

  if (!meal) {
    return (
      <View style={globalStyles.container}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={globalStyles.empty}>Meal not found.</Text>
      </View>
    );
  }

  return (
    <KeyboardScrollView
      ref={scrollRef}
      style={globalStyles.container}
      contentContainerStyle={styles.content}
    >
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={22} color={colors.primary} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <View style={globalStyles.header}>
        <Text style={globalStyles.title}>Meal details</Text>
        <TouchableOpacity
          onPress={() => void handleToggleFavorite()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={
            isFavorite ? "Remove from favorites" : "Save as favorite"
          }
        >
          <Ionicons
            name={isFavorite ? "star" : "star-outline"}
            size={24}
            color={isFavorite ? colors.primary : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

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
        style={styles.button}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.buttonText}>
          {saving ? "Saving..." : "Save changes"}
        </Text>
      </TouchableOpacity>
    </KeyboardScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
  },
  back: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backText: {
    color: colors.primary,
    fontSize: 16,
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
