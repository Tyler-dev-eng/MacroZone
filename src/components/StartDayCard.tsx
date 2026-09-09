import { colors } from "@/styles/global";
import { withAlpha } from "@/utils/color";
import {
  defaultMealType,
  MEAL_TYPE_META,
  mealTypeLabel,
  type MealType,
} from "@/utils/mealType";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const COPY: Record<MealType, { title: string; detail: string }> = {
  breakfast: {
    title: "Start your day",
    detail: "Log breakfast to enter the zone.",
  },
  lunch: {
    title: "Nothing logged yet",
    detail: "Add lunch and today’s story begins.",
  },
  dinner: {
    title: "The day is still open",
    detail: "Log dinner to step into the zone.",
  },
  snack: {
    title: "Ready when you are",
    detail: "Log a snack — or any meal — to begin.",
  },
};

export default function StartDayCard() {
  const type = defaultMealType();
  const meta = MEAL_TYPE_META[type];
  const label = mealTypeLabel(type);
  const copy = COPY[type];

  return (
    <View
      style={[styles.shadow, { shadowColor: meta.color }]}
      accessibilityRole="text"
      accessibilityLabel={`${copy.title}. ${copy.detail}`}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: withAlpha(meta.color, 0.16),
            borderColor: withAlpha(meta.color, 0.4),
          },
        ]}
      >
        <View
          pointerEvents="none"
          style={[styles.blob, { backgroundColor: meta.color }]}
        />
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: withAlpha(meta.color, 0.28) },
          ]}
        >
          <Ionicons name={meta.icon} size={22} color={meta.color} />
        </View>
        <Text style={[styles.title, { color: meta.color }]}>{copy.title}</Text>
        <Text style={styles.detail}>{copy.detail}</Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: meta.color }]}
          onPress={() =>
            router.navigate({
              pathname: "/add-meals",
              params: { type },
            })
          }
          accessibilityRole="button"
          accessibilityLabel={`Log ${label.toLowerCase()}`}
        >
          <Ionicons name="add" size={20} color={colors.background} />
          <Text style={styles.buttonText}>Log {label.toLowerCase()}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    marginBottom: 8,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 14,
    elevation: 8,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    overflow: "hidden",
    borderWidth: 1,
  },
  blob: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.22,
    top: -48,
    right: -36,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginTop: 14,
    fontSize: 22,
    fontWeight: "800",
  },
  detail: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 21,
    color: colors.text,
    fontWeight: "600",
  },
  button: {
    marginTop: 18,
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "800",
  },
});
