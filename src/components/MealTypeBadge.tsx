import { withAlpha } from "@/utils/color";
import {
  MEAL_TYPE_META,
  mealTypeLabel,
  normalizeMealType,
} from "@/utils/mealType";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

type MealTypeBadgeProps = {
  type: string;
};

export default function MealTypeBadge({ type }: MealTypeBadgeProps) {
  const normalized = normalizeMealType(type);
  const meta = MEAL_TYPE_META[normalized];

  return (
    <View
      style={[styles.badge, { backgroundColor: withAlpha(meta.color, 0.22) }]}
    >
      <Ionicons name={meta.icon} size={12} color={meta.color} />
      <Text style={[styles.label, { color: meta.color }]}>
        {mealTypeLabel(normalized)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: "800",
  },
});
