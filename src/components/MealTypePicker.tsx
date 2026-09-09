import { colors } from "@/styles/global";
import { withAlpha } from "@/utils/color";
import {
  MEAL_TYPE_META,
  MEAL_TYPES,
  mealTypeLabel,
  type MealType,
} from "@/utils/mealType";
import { Ionicons } from "@expo/vector-icons";
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
        const meta = MEAL_TYPE_META[type];
        return (
          <TouchableOpacity
            key={type}
            style={[
              styles.chip,
              {
                backgroundColor: selected
                  ? meta.color
                  : withAlpha(meta.color, 0.16),
                borderColor: withAlpha(meta.color, selected ? 0.9 : 0.4),
              },
            ]}
            onPress={() => onChange(type)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={mealTypeLabel(type)}
          >
            <Ionicons
              name={meta.icon}
              size={18}
              color={selected ? colors.background : meta.color}
            />
            <Text
              style={[
                styles.chipText,
                { color: selected ? colors.background : meta.color },
              ]}
              numberOfLines={1}
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
    gap: 8,
    marginTop: 16,
  },
  chip: {
    flex: 1,
    minHeight: 72,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },
});
