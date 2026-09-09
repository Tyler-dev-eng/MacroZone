import { type Meal } from "@/storage/meals";
import { type Targets } from "@/storage/targets";
import { colors } from "@/styles/global";
import {
  buildDailyMacros,
  dayNumberLabel,
  weekdayLabel,
  type DayMacros,
} from "@/utils/trend";
import { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Range = 7 | 14;
type MacroKey = keyof Pick<DayMacros, "calories" | "protein" | "carbs" | "fat">;

type Series = {
  key: MacroKey;
  label: string;
  color: string;
  unit: string;
};

const SERIES: Series[] = [
  { key: "calories", label: "Calories", color: "#ff6b6b", unit: "" },
  { key: "protein", label: "Protein", color: "#4ecdc4", unit: "g" },
  { key: "carbs", label: "Carbs", color: "#ffd93d", unit: "g" },
  { key: "fat", label: "Fat", color: "#6bcb77", unit: "g" },
];

type TrendChartProps = {
  meals: Meal[];
  targets: Targets;
};

const CHART_HEIGHT = 96;

const formatAmount = (value: number, unit: string): string => {
  const rounded = Math.round(value);
  if (unit) return `${rounded}${unit}`;
  return rounded.toLocaleString("en-US");
};

export default function TrendChart({ meals, targets }: TrendChartProps) {
  const [range, setRange] = useState<Range>(7);
  const days = useMemo(() => buildDailyMacros(meals, range), [meals, range]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const selected =
    days.find((day) => day.key === selectedKey) ?? days[days.length - 1];
  const loggedDays = days.filter((day) => day.calories > 0).length;

  return (
    <View>
      <View style={styles.header}>
        <View style={styles.toggles}>
          {([7, 14] as const).map((option) => {
            const selectedRange = option === range;
            return (
              <TouchableOpacity
                key={option}
                style={[styles.toggle, selectedRange && styles.toggleSelected]}
                onPress={() => {
                  setRange(option);
                  setSelectedKey(null);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedRange }}
                accessibilityLabel={`Last ${option} days`}
              >
                <Text
                  style={[
                    styles.toggleText,
                    selectedRange && styles.toggleTextSelected,
                  ]}
                >
                  {option}d
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={styles.loggedCount}>
          {loggedDays === 0
            ? "No meals in this range"
            : `${loggedDays} day${loggedDays === 1 ? "" : "s"} logged`}
        </Text>
      </View>

      {SERIES.map((series) => {
        const values = days.map((day) => day[series.key]);
        const target = targets[series.key];
        const max = Math.max(target, ...values, 1);
        return (
          <BarChart
            key={series.key}
            label={series.label}
            color={series.color}
            target={target}
            max={max}
            values={values}
            dayKeys={days.map((day) => day.key)}
            selectedKey={selected?.key ?? null}
            onSelect={setSelectedKey}
            unit={series.unit}
          />
        );
      })}

      <View style={styles.labels}>
        {days.map((day) => (
          <Text key={day.key} style={styles.dayLabel} numberOfLines={1}>
            {range === 7 ? weekdayLabel(day.date) : dayNumberLabel(day.date)}
          </Text>
        ))}
      </View>

      {selected ? (
        <Text style={styles.caption}>
          {selected.date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
          {" · "}
          {SERIES.map((series, index) => {
            const prefix = index === 0 ? "" : " · ";
            const amount = formatAmount(selected[series.key], series.unit);
            const suffix = series.unit ? "" : " cal";
            return `${prefix}${amount}${suffix}`;
          }).join("")}
        </Text>
      ) : null}
      <Text style={styles.average}>
        Avg{" "}
        {SERIES.map((series, index) => {
          const avg = Math.round(
            days.reduce((sum, day) => sum + day[series.key], 0) / days.length,
          );
          const prefix = index === 0 ? "" : " · ";
          return `${prefix}${formatAmount(avg, series.unit)}${series.unit ? "" : " cal"}`;
        }).join("")}
      </Text>
    </View>
  );
}

function BarChart({
  label,
  color,
  target,
  max,
  values,
  dayKeys,
  selectedKey,
  onSelect,
  unit,
}: {
  label: string;
  color: string;
  target: number;
  max: number;
  values: number[];
  dayKeys: string[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
  unit: string;
}) {
  const targetTop = Math.max(0, (1 - target / max) * CHART_HEIGHT);

  return (
    <View style={styles.chartBlock}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartLabel}>{label}</Text>
        <Text style={styles.chartTarget}>
          goal {unit ? `${target}${unit}` : target.toLocaleString("en-US")}
        </Text>
      </View>
      <View style={styles.plot}>
        <View
          pointerEvents="none"
          style={[styles.targetLine, { top: targetTop }]}
          accessibilityLabel={`${label} target`}
        />
        {values.map((value, index) => {
          const key = dayKeys[index] ?? String(index);
          const height = Math.max(2, (value / max) * CHART_HEIGHT);
          const isOver = value > target;
          const isSelected = key === selectedKey;
          return (
            <TouchableOpacity
              key={key}
              style={styles.barHit}
              onPress={() => onSelect(key)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${label} ${formatAmount(value, unit)}`}
            >
              <View
                style={[
                  styles.bar,
                  {
                    height,
                    backgroundColor: isOver ? colors.alert : color,
                    opacity: isSelected ? 1 : 0.75,
                  },
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  toggles: {
    flexDirection: "row",
    gap: 8,
  },
  toggle: {
    minHeight: 32,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: colors.surface,
    justifyContent: "center",
  },
  toggleSelected: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
  },
  toggleTextSelected: {
    color: colors.background,
  },
  loggedCount: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  chartBlock: {
    marginTop: 16,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  chartLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  chartTarget: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  plot: {
    height: CHART_HEIGHT,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    position: "relative",
  },
  targetLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  barHit: {
    flex: 1,
    height: CHART_HEIGHT,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  bar: {
    width: "70%",
    maxWidth: 18,
    borderRadius: 3,
  },
  labels: {
    flexDirection: "row",
    gap: 4,
    marginTop: 6,
  },
  dayLabel: {
    flex: 1,
    textAlign: "center",
    color: colors.textSecondary,
    fontSize: 11,
  },
  caption: {
    color: colors.text,
    fontSize: 14,
    marginTop: 16,
  },
  average: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
});
