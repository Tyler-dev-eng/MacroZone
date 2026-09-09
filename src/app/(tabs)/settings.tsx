import KeyboardScrollView from "@/components/KeyboardScrollView";
import { DEFAULT_TARGETS, getTargets, saveTargets } from "@/storage/targets";
import { colors, globalStyles } from "@/styles/global";
import { useFocusEffect } from "expo-router";
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

export default function SettingsScreen() {
  const [calories, setCalories] = useState(String(DEFAULT_TARGETS.calories));
  const [protein, setProtein] = useState(String(DEFAULT_TARGETS.protein));
  const [carbs, setCarbs] = useState(String(DEFAULT_TARGETS.carbs));
  const [fat, setFat] = useState(String(DEFAULT_TARGETS.fat));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadTargets = async () => {
    try {
      const saved = await getTargets();
      setCalories(String(saved.calories));
      setProtein(String(saved.protein));
      setCarbs(String(saved.carbs));
      setFat(String(saved.fat));
    } catch {
      Alert.alert("Couldn't load", "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      void loadTargets();
    }, []),
  );

  const handleSave = async () => {
    if (saving) return;

    const parsedCalories = toNumber(calories);
    const parsedProtein = toNumber(protein);
    const parsedCarbs = toNumber(carbs);
    const parsedFat = toNumber(fat);

    if (
      parsedCalories === null ||
      parsedProtein === null ||
      parsedCarbs === null ||
      parsedFat === null
    ) {
      Alert.alert(
        "Missing info",
        "Please enter a number for calories, protein, carbs, and fat.",
      );
      return;
    }

    if (
      parsedCalories < 0 ||
      parsedProtein < 0 ||
      parsedCarbs < 0 ||
      parsedFat < 0
    ) {
      Alert.alert("Invalid targets", "Targets can't be negative.");
      return;
    }

    setSaving(true);
    try {
      await saveTargets({
        calories: Math.round(parsedCalories),
        protein: parsedProtein,
        carbs: parsedCarbs,
        fat: parsedFat,
      });
      Alert.alert("Saved", "Your daily targets have been updated.");
    } catch {
      Alert.alert("Couldn't save", "Something went wrong. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardScrollView
      style={globalStyles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={globalStyles.title}>Settings</Text>
      <Text style={globalStyles.sectionTitle}>Daily targets</Text>
      <Text style={styles.hint}>These goals show on the home screen.</Text>

      {loading ? (
        <Text style={globalStyles.empty}>Loading...</Text>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Calories"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
            value={calories}
            onChangeText={setCalories}
            accessibilityLabel="Daily calorie target"
          />

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.rowInput]}
              placeholder="Protein (g)"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={protein}
              onChangeText={setProtein}
              accessibilityLabel="Daily protein target in grams"
            />
            <TextInput
              style={[styles.input, styles.rowInput]}
              placeholder="Carbs (g)"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={carbs}
              onChangeText={setCarbs}
              accessibilityLabel="Daily carb target in grams"
            />
            <TextInput
              style={[styles.input, styles.rowInput]}
              placeholder="Fat (g)"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={fat}
              onChangeText={setFat}
              accessibilityLabel="Daily fat target in grams"
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleSave}
            disabled={saving}
            accessibilityRole="button"
            accessibilityLabel="Save daily targets"
          >
            <Text style={styles.buttonText}>
              {saving ? "Saving..." : "Save targets"}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </KeyboardScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: -8,
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
