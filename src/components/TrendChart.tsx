import { type Meal } from "@/storage/meals";
import { type Targets } from "@/storage/targets";
import { colors } from "@/styles/global";
import { withAlpha } from "@/utils/color";
import {
  buildDailyMacros,
  dayNumberLabel,
  weekdayLabel,
  type DayMacros,
} from "@/utils/trend";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Range = 7 | 14;
type MacroKey = keyof Pick<DayMacros, "calories" | "protein" | "carbs" | "fat">;

type Series = {
  key: MacroKey;
  label: string;
  color: string;
  unit: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const SERIES: Series[] = [
  {
    key: "calories",
    label: "Calories",
    color: "#ff6b6b",
    unit: "",
    icon: "flame",
  },
  {
    key: "protein",
    label: "Protein",
    color: "#4ecdc4",
    unit: "g",
    icon: "barbell",
  },
  {
    key: "carbs",
    label: "Carbs",
    color: "#ffd93d",
    unit: "g",
    icon: "nutrition",
  },
  { key: "fat", label: "Fat", color: "#6bcb77", unit: "g", icon: "water" },
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

const formatDay = (date: Date): string =>
  date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

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
        const avg = Math.round(
          days.reduce((sum, day) => sum + day[series.key], 0) / days.length,
        );
        return (
          <BarChart
            key={series.key}
            series={series}
            target={target}
            max={max}
            avg={avg}
            values={values}
            days={days}
            range={range}
            selectedKey={selected?.key ?? null}
            onSelect={setSelectedKey}
          />
        );
      })}

      {selected ? (
        <View style={styles.summaryShadow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryDate}>{formatDay(selected.date)}</Text>
            <View style={styles.summaryChips}>
              {SERIES.map((series) => (
                <View
                  key={series.key}
                  style={[
                    styles.summaryChip,
                    { backgroundColor: withAlpha(series.color, 0.18) },
                  ]}
                >
                  <Ionicons name={series.icon} size={12} color={series.color} />
                  <Text
                    style={[styles.summaryChipText, { color: series.color }]}
                  >
                    {formatAmount(selected[series.key], series.unit)}
                    {series.unit ? "" : " cal"}
                  </Text>
                </View>
              ))}
            </View>
            <Text style={styles.average}>
              Avg{" "}
              {SERIES.map((series, index) => {
                const avg = Math.round(
                  days.reduce((sum, day) => sum + day[series.key], 0) /
                    days.length,
                );
                const prefix = index === 0 ? "" : " · ";
                return `${prefix}${formatAmount(avg, series.unit)}${series.unit ? "" : " cal"}`;
              }).join("")}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function BarChart({
  series,
  target,
  max,
  avg,
  values,
  days,
  range,
  selectedKey,
  onSelect,
}: {
  series: Series;
  target: number;
  max: number;
  avg: number;
  values: number[];
  days: DayMacros[];
  range: Range;
  selectedKey: string | null;
  onSelect: (key: string) => void;
}) {
  const { label, color, unit, icon } = series;
  const targetTop = Math.max(0, (1 - target / max) * CHART_HEIGHT);
  const isOver = avg > target;
  const fillColor = isOver ? colors.alert : color;
  const percent =
    target <= 0 ? (avg > 0 ? 100 : 0) : Math.round((avg / target) * 100);
  const remainingLabel = isOver
    ? `${formatAmount(avg - target, unit)} over`
    : `${formatAmount(target - avg, unit)} under`;
  const selectedDay = days.find((day) => day.key === selectedKey);

  return (
    <View style={[styles.shadow, { shadowColor: color }]}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: withAlpha(color, 0.14),
            borderColor: withAlpha(color, 0.38),
          },
        ]}
      >
        <View
          pointerEvents="none"
          style={[styles.blob, { backgroundColor: color }]}
        />

        <View style={styles.topRow}>
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: withAlpha(color, 0.28) },
            ]}
          >
            <Ionicons name={icon} size={16} color={color} />
          </View>
          <Text style={[styles.chartLabel, { color }]}>{label}</Text>
          <View
            style={[
              styles.percentChip,
              { backgroundColor: withAlpha(fillColor, 0.22) },
            ]}
          >
            <Text style={[styles.percent, { color: fillColor }]}>
              {percent}%
            </Text>
          </View>
        </View>

        <Text style={styles.value}>{formatAmount(avg, unit)}</Text>
        <Text style={styles.goal}>
          avg of {formatAmount(target, unit)} goal
        </Text>

        <View
          style={[
            styles.remainingChip,
            { backgroundColor: withAlpha(fillColor, isOver ? 0.22 : 0.16) },
          ]}
        >
          <Text style={[styles.remaining, { color: fillColor }]}>
            {remainingLabel}
          </Text>
        </View>

        <View style={styles.plot}>
          <View
            pointerEvents="none"
            style={[
              styles.targetLine,
              { top: targetTop, backgroundColor: withAlpha(color, 0.55) },
            ]}
            accessibilityLabel={`${label} target`}
          />
          {values.map((value, index) => {
            const key = days[index]?.key ?? String(index);
            const height = Math.max(2, (value / max) * CHART_HEIGHT);
            const barOver = value > target;
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
                      backgroundColor: barOver ? colors.alert : color,
                      opacity: isSelected ? 1 : 0.72,
                    },
                  ]}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.labels}>
          {days.map((day) => (
            <Text key={day.key} style={styles.dayLabel} numberOfLines={1}>
              {range === 7 ? weekdayLabel(day.date) : dayNumberLabel(day.date)}
            </Text>
          ))}
        </View>

        {selectedDay ? (
          <Text style={styles.caption}>
            {formatDay(selectedDay.date)}
            {" · "}
            {formatAmount(selectedDay[series.key], unit)}
            {unit ? "" : " cal"}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
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
  shadow: {
    marginTop: 14,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 14,
    elevation: 8,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    overflow: "hidden",
    borderWidth: 1,
  },
  blob: {
    position: "absolute",
    width: 92,
    height: 92,
    borderRadius: 46,
    opacity: 0.22,
    top: -34,
    right: -28,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  chartLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
  },
  percentChip: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  percent: {
    fontSize: 12,
    fontWeight: "800",
  },
  value: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
    marginTop: 12,
    letterSpacing: -0.5,
  },
  goal: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  remainingChip: {
    alignSelf: "flex-start",
    marginTop: 10,
    marginBottom: 12,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  remaining: {
    fontSize: 12,
    fontWeight: "700",
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
    borderRadius: 6,
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
    marginTop: 12,
    fontWeight: "600",
  },
  summaryShadow: {
    marginTop: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 6,
  },
  summaryCard: {
    borderRadius: 20,
    padding: 16,
    overflow: "hidden",
    borderWidth: 1,
    backgroundColor: withAlpha(colors.primary, 0.12),
    borderColor: withAlpha(colors.primary, 0.32),
  },
  summaryDate: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  summaryChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  summaryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  summaryChipText: {
    fontSize: 13,
    fontWeight: "700",
  },
  average: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 12,
  },
});
