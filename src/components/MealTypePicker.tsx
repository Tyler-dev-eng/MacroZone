import { colors } from "@/styles/global";
import { MEAL_TYPES, mealTypeLabel, type MealType } from "@/utils/mealType";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type MealTypePickerProps = {
  value: MealType;
  onChange: (type: MealType) => void;
};

export default function MealTypePicker({
  value,
  onChange,
}: MealTypePickerProps) {
  return (
    <View style={styles.wrap}>
      {MEAL_TYPES.map((type) => {
        const selected = type === value;
        return (
          <TouchableOpacity
            key={type}
            style={[styles.chip, selected && styles.chipSelected]}
            onPress={() => onChange(type)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={mealTypeLabel(type)}
          >
            <Text
              style={[styles.chipText, selected && styles.chipTextSelected]}
            >
              {mealTypeLabel(type)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
  },
  chip: {
    flexGrow: 1,
    flexBasis: "22%",
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  chipSelected: {
    backgroundColor: colors.primary,
  },
  chipText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
  },
  chipTextSelected: {
    color: colors.background,
  },
});
