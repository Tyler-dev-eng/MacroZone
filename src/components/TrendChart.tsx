import { type Meal } from "@/storage/meals";
import { type Targets } from "@/storage/targets";
import { colors } from "@/styles/global";
import { withAlpha } from "@/utils/color";
import { localDayKey } from "@/utils/dates";
import {
  buildDailyMacros,
  dayNumberLabel,
  weekdayLabel,
  type DayMacros,
} from "@/utils/trend";
import { MEAL_TYPE_META, MEAL_TYPES, groupMealsByType } from "@/utils/mealType";
import {
  getMacroRange,
  getZoneStatus,
  type MacroRange,
  type ZoneKind,
  type ZoneStatus,
} from "@/utils/zone";
import MealTypeBadge from "@/components/MealTypeBadge";
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

const ZONE_GREEN = "#6bcb77";

const ZONE_DOT: Record<ZoneKind, string> = {
  empty: colors.textSecondary,
  onTrack: colors.primary,
  close: "#ffd93d",
  inZone: ZONE_GREEN,
  over: colors.alert,
};

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

const barColor = (range: MacroRange, seriesColor: string): string => {
  if (range === "over") return colors.alert;
  if (range === "inRange") return ZONE_GREEN;
  if (range === "short") return seriesColor;
  return "rgba(255, 255, 255, 0.18)";
};

const pastZoneCopy = (
  status: ZoneStatus,
): { title: string; detail: string } => {
  if (status.kind === "empty") {
    return { title: "No meals", detail: "Nothing logged" };
  }
  return { title: status.title, detail: status.detail };
};

export default function TrendChart({ meals, targets }: TrendChartProps) {
  const [range, setRange] = useState<Range>(7);
  const days = useMemo(() => buildDailyMacros(meals, range), [meals, range]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const zoneByDay = useMemo(
    () => days.map((day) => getZoneStatus(day, targets)),
    [days, targets],
  );
  const inZoneCount = zoneByDay.filter(
    (status) => status.kind === "inZone",
  ).length;

  const selectedIndex = selectedKey
    ? days.findIndex((day) => day.key === selectedKey)
    : days.length - 1;
  const selected = days[selectedIndex] ?? days[days.length - 1];
  const selectedZone = zoneByDay[selectedIndex] ?? zoneByDay[days.length - 1];
  const selectedDayMeals = useMemo(() => {
    if (!selected) return [];
    return meals.filter(
      (meal) => localDayKey(new Date(meal.createdAt)) === selected.key,
    );
  }, [meals, selected]);

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
      </View>

      <View style={[styles.scoreShadow, { shadowColor: ZONE_GREEN }]}>
        <View style={styles.scoreCard}>
          <View
            pointerEvents="none"
            style={[styles.blob, { backgroundColor: ZONE_GREEN }]}
          />
          <View style={styles.scoreTop}>
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: withAlpha(ZONE_GREEN, 0.28) },
              ]}
            >
              <Ionicons name="flash" size={16} color={ZONE_GREEN} />
            </View>
            <View style={styles.scoreText}>
              <Text
                style={styles.scoreValue}
                accessibilityLabel={`${inZoneCount} of ${range} days in the zone`}
              >
                {inZoneCount} / {range}
              </Text>
              <Text style={styles.scoreLabel}>days in zone</Text>
            </View>
          </View>
          <View style={styles.dots}>
            {days.map((day, index) => {
              const status = zoneByDay[index];
              const isSelected = day.key === selected?.key;
              return (
                <TouchableOpacity
                  key={day.key}
                  style={styles.dotHit}
                  onPress={() => setSelectedKey(day.key)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`${formatDay(day.date)}, ${pastZoneCopy(status ?? getZoneStatus(day, targets)).title}`}
                >
                  <View
                    style={[
                      styles.dot,
                      {
                        backgroundColor: ZONE_DOT[status?.kind ?? "empty"],
                        opacity: isSelected ? 1 : 0.55,
                      },
                    ]}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {SERIES.map((series) => {
        const values = days.map((day) => day[series.key]);
        const target = targets[series.key];
        const max = Math.max(target, ...values, 1);
        const inRangeCount = values.filter(
          (value) => getMacroRange(value, target) === "inRange",
        ).length;
        return (
          <BarChart
            key={series.key}
            series={series}
            target={target}
            max={max}
            inRangeCount={inRangeCount}
            range={range}
            values={values}
            days={days}
            selectedKey={selected?.key ?? null}
            onSelect={setSelectedKey}
          />
        );
      })}

      {selected && selectedZone ? (
        <View
          style={[
            styles.summaryShadow,
            { shadowColor: ZONE_DOT[selectedZone.kind] },
          ]}
        >
          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: withAlpha(ZONE_DOT[selectedZone.kind], 0.12),
                borderColor: withAlpha(ZONE_DOT[selectedZone.kind], 0.32),
              },
            ]}
          >
            <Text style={styles.summaryDate}>{formatDay(selected.date)}</Text>
            <Text
              style={[
                styles.summaryZone,
                { color: ZONE_DOT[selectedZone.kind] },
              ]}
            >
              {pastZoneCopy(selectedZone).title}
            </Text>
            <Text style={styles.summaryDetail}>
              {pastZoneCopy(selectedZone).detail}
            </Text>
            <View style={styles.summaryChips}>
              {SERIES.map((series) => {
                const rangeKind = getMacroRange(
                  selected[series.key],
                  targets[series.key],
                );
                const tint = barColor(rangeKind, series.color);
                return (
                  <View
                    key={series.key}
                    style={[
                      styles.summaryChip,
                      { backgroundColor: withAlpha(tint, 0.2) },
                    ]}
                  >
                    <Ionicons name={series.icon} size={12} color={tint} />
                    <Text style={[styles.summaryChipText, { color: tint }]}>
                      {formatAmount(selected[series.key], series.unit)}
                      {series.unit ? "" : " cal"}
                    </Text>
                  </View>
                );
              })}
            </View>
            <MealTypeMix meals={selectedDayMeals} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

function MealTypeMix({ meals }: { meals: Meal[] }) {
  const groups = groupMealsByType(meals);
  const slices = MEAL_TYPES.map((type) => ({
    type,
    calories: groups[type].reduce((sum, meal) => sum + meal.calories, 0),
  })).filter((slice) => slice.calories > 0);
  const total = slices.reduce((sum, slice) => sum + slice.calories, 0);
  if (total === 0) return null;

  return (
    <View style={styles.mix}>
      <Text style={styles.mixLabel}>By meal</Text>
      <View
        style={styles.mixBar}
        accessibilityLabel={slices
          .map(
            (slice) => `${slice.type} ${Math.round(slice.calories)} calories`,
          )
          .join(", ")}
      >
        {slices.map((slice) => (
          <View
            key={slice.type}
            style={[
              styles.mixSegment,
              {
                flex: slice.calories,
                backgroundColor: MEAL_TYPE_META[slice.type].color,
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.mixChips}>
        {slices.map((slice) => (
          <View key={slice.type} style={styles.mixChip}>
            <MealTypeBadge type={slice.type} />
            <Text style={styles.mixCal}>
              {Math.round(slice.calories).toLocaleString("en-US")} cal
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function BarChart({
  series,
  target,
  max,
  inRangeCount,
  range,
  values,
  days,
  selectedKey,
  onSelect,
}: {
  series: Series;
  target: number;
  max: number;
  inRangeCount: number;
  range: Range;
  values: number[];
  days: DayMacros[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
}) {
  const { label, color, unit, icon } = series;
  const targetTop = Math.max(0, (1 - target / max) * CHART_HEIGHT);
  const selectedDay = days.find((day) => day.key === selectedKey);
  const selectedRange = selectedDay
    ? getMacroRange(selectedDay[series.key], target)
    : null;

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
              { backgroundColor: withAlpha(ZONE_GREEN, 0.22) },
            ]}
          >
            <Text style={[styles.percent, { color: ZONE_GREEN }]}>
              {inRangeCount} / {range}
            </Text>
          </View>
        </View>

        <Text style={styles.goal}>days in range</Text>

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
            const macroRange = getMacroRange(value, target);
            const isSelected = key === selectedKey;
            return (
              <TouchableOpacity
                key={key}
                style={styles.barHit}
                onPress={() => onSelect(key)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`${label} ${formatAmount(value, unit)}, ${macroRange === "inRange" ? "in range" : macroRange === "over" ? "over target" : macroRange === "short" ? "under target" : "no meals"}`}
              >
                <View
                  style={[
                    styles.bar,
                    {
                      height,
                      backgroundColor: barColor(macroRange, color),
                      opacity: isSelected ? 1 : 0.78,
                    },
                  ]}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.labels}>
          {days.map((day, index) => {
            const macroRange = getMacroRange(values[index] ?? 0, target);
            return (
              <Text
                key={day.key}
                style={[
                  styles.dayLabel,
                  {
                    color:
                      macroRange === "empty"
                        ? colors.textSecondary
                        : barColor(macroRange, color),
                  },
                ]}
                numberOfLines={1}
              >
                {range === 7
                  ? weekdayLabel(day.date)
                  : dayNumberLabel(day.date)}
              </Text>
            );
          })}
        </View>

        {selectedDay && selectedRange ? (
          <Text style={styles.caption}>
            {formatDay(selectedDay.date)}
            {" · "}
            {formatAmount(selectedDay[series.key], unit)}
            {unit ? "" : " cal"}
            {" · "}
            {selectedRange === "inRange"
              ? "in range"
              : selectedRange === "over"
                ? "over"
                : selectedRange === "short"
                  ? "under"
                  : "no meals"}
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
  scoreShadow: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 14,
    elevation: 8,
  },
  scoreCard: {
    borderRadius: 20,
    padding: 16,
    overflow: "hidden",
    borderWidth: 1,
    backgroundColor: withAlpha(ZONE_GREEN, 0.14),
    borderColor: withAlpha(ZONE_GREEN, 0.38),
  },
  scoreTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  scoreText: {
    flex: 1,
  },
  scoreValue: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  scoreLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },
  dots: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
    alignItems: "center",
  },
  dotHit: {
    flex: 1,
    minHeight: 44,
    justifyContent: "center",
  },
  dot: {
    height: 10,
    borderRadius: 5,
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
  goal: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 8,
    marginBottom: 12,
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
    fontSize: 11,
    fontWeight: "700",
  },
  caption: {
    color: colors.text,
    fontSize: 14,
    marginTop: 12,
    fontWeight: "600",
  },
  summaryShadow: {
    marginTop: 14,
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
  },
  summaryDate: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  summaryZone: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: "800",
  },
  summaryDetail: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
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
  mix: {
    marginTop: 16,
  },
  mixLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
  },
  mixBar: {
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  mixSegment: {
    height: "100%",
  },
  mixChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
    alignItems: "center",
  },
  mixChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  mixCal: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
  },
});
