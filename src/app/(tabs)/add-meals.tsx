import LoggedAtField from "@/components/LoggedAtField";
import MealPhotoPicker from "@/components/MealPhotoPicker";
import MealTypePicker from "@/components/MealTypePicker";
import { addMeal } from "@/storage/meals";
import { colors, globalStyles } from "@/styles/global";
import { defaultMealType, type MealType } from "@/utils/mealType";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
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
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [mealType, setMealType] = useState<MealType>(defaultMealType);
  const [loggedAt, setLoggedAt] = useState(() => new Date());
  const [saving, setSaving] = useState(false);

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
      await addMeal({
        name: trimmedName,
        calories: Math.round(parsedCalories),
        protein: toNumber(protein) ?? 0,
        carbs: toNumber(carbs) ?? 0,
        fat: toNumber(fat) ?? 0,
        imageUri,
        mealType,
        createdAt: loggedAt.toISOString(),
      });
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

    // Switch to the Home tab (push would stack another Home on this tab).
    router.navigate("/");
  };

  return (
    <ScrollView
      style={globalStyles.container}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text style={globalStyles.title}>Add Meal</Text>

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
        onPress={handleAddMeal}
        disabled={saving}
      >
        <Text style={styles.buttonText}>
          {saving ? "Adding..." : "Add Meal"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
