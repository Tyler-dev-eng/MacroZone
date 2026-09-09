import { colors } from "@/styles/global";
import { formatLoggedAtDate } from "@/utils/mealType";
import { type DatePreset } from "@/utils/dates";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const PRESETS: { id: DatePreset; label: string }[] = [
  { id: "all", label: "All" },
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "week", label: "Last 7 days" },
  { id: "custom", label: "Custom" },
];

type MealsFiltersProps = {
  query: string;
  onQueryChange: (query: string) => void;
  preset: DatePreset;
  onPresetChange: (preset: DatePreset) => void;
  from: Date | null;
  to: Date | null;
  onFromChange: (date: Date) => void;
  onToChange: (date: Date) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
};

export default function MealsFilters({
  query,
  onQueryChange,
  preset,
  onPresetChange,
  from,
  to,
  onFromChange,
  onToChange,
  onClear,
  hasActiveFilters,
}: MealsFiltersProps) {
  const [picker, setPicker] = useState<"from" | "to" | null>(null);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search meals"
        placeholderTextColor={colors.textSecondary}
        value={query}
        onChangeText={onQueryChange}
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
        accessibilityLabel="Search meals"
      />

      <View style={styles.chips}>
        {PRESETS.map((item) => {
          const selected = item.id === preset;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => onPresetChange(item.id)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`Filter ${item.label}`}
            >
              <Text
                style={[styles.chipText, selected && styles.chipTextSelected]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {preset === "custom" ? (
        <View style={styles.range}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setPicker(picker === "from" ? null : "from")}
            accessibilityRole="button"
            accessibilityLabel="Filter from date"
          >
            <Text style={styles.dateLabel}>From</Text>
            <Text style={styles.dateValue}>
              {from ? formatLoggedAtDate(from) : "Any"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setPicker(picker === "to" ? null : "to")}
            accessibilityRole="button"
            accessibilityLabel="Filter to date"
          >
            <Text style={styles.dateLabel}>To</Text>
            <Text style={styles.dateValue}>
              {to ? formatLoggedAtDate(to) : "Any"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {picker && preset === "custom" ? (
        <DateTimePicker
          value={picker === "from" ? (from ?? new Date()) : (to ?? new Date())}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          themeVariant="dark"
          textColor={colors.text}
          onValueChange={(_, selected) => {
            if (Platform.OS === "android") setPicker(null);
            if (picker === "from") onFromChange(selected);
            else onToChange(selected);
          }}
          onDismiss={() => setPicker(null)}
        />
      ) : null}

      {hasActiveFilters ? (
        <TouchableOpacity
          onPress={onClear}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Clear filters"
        >
          <Text style={styles.clear}>Clear filters</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  search: {
    backgroundColor: colors.surface,
    color: colors.text,
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  chip: {
    minHeight: 36,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: colors.surface,
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
  range: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  dateButton: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 10,
    minHeight: 44,
    justifyContent: "center",
  },
  dateLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 2,
  },
  dateValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  clear: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
  },
});
