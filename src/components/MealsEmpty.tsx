import { colors } from "@/styles/global";
import { withAlpha } from "@/utils/color";
import { type DatePreset } from "@/utils/dates";
import {
  defaultMealType,
  formatLoggedAtDate,
  mealTypeLabel,
} from "@/utils/mealType";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type MealsEmptyProps =
  | { kind: "history" }
  | {
      kind: "filters";
      query: string;
      preset: DatePreset;
      from: Date | null;
      to: Date | null;
      onClear: () => void;
    };

const ACCENT = colors.primary;

/** Empty All Meals: first log vs no results for the current search/dates. */
export default function MealsEmpty(props: MealsEmptyProps) {
  const copy = props.kind === "history" ? HISTORY_COPY : filterCopy(props);
  const icon =
    props.kind === "history" ? "restaurant-outline" : filterIcon(props.query);
  const showLog = props.kind === "history" || !props.query.trim();
  const type = defaultMealType();
  const label = mealTypeLabel(type);

  return (
    <View
      style={[styles.shadow, { shadowColor: ACCENT }]}
      accessibilityRole="text"
      accessibilityLabel={`${copy.title}. ${copy.detail}`}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: withAlpha(ACCENT, 0.14),
            borderColor: withAlpha(ACCENT, 0.38),
          },
        ]}
      >
        <View
          pointerEvents="none"
          style={[styles.blob, { backgroundColor: ACCENT }]}
        />
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: withAlpha(ACCENT, 0.26) },
          ]}
        >
          <Ionicons name={icon} size={22} color={ACCENT} />
        </View>
        <Text style={[styles.title, { color: ACCENT }]}>{copy.title}</Text>
        <Text style={styles.detail}>{copy.detail}</Text>
        {showLog ? (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: ACCENT }]}
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
            <Text style={styles.buttonText}>Log a meal</Text>
          </TouchableOpacity>
        ) : null}
        {props.kind === "filters" ? (
          <TouchableOpacity
            style={
              showLog
                ? styles.secondary
                : [styles.button, { backgroundColor: ACCENT }]
            }
            onPress={props.onClear}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Clear filters"
          >
            {showLog ? (
              <Text style={styles.secondaryText}>Show all meals</Text>
            ) : (
              <>
                <Ionicons name="close" size={18} color={colors.background} />
                <Text style={styles.buttonText}>Clear filters</Text>
              </>
            )}
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const HISTORY_COPY = {
  title: "Your log is empty",
  detail:
    "Meals you add land here by day. Search, filter, favorite, or log them again anytime.",
};

const describeRange = (
  preset: DatePreset,
  from: Date | null,
  to: Date | null,
): string => {
  if (preset === "today") return "today";
  if (preset === "yesterday") return "yesterday";
  if (preset === "week") return "the last 7 days";
  if (preset === "custom") {
    if (from && to) {
      return `${formatLoggedAtDate(from)} – ${formatLoggedAtDate(to)}`;
    }
    if (from) return `from ${formatLoggedAtDate(from)}`;
    if (to) return `through ${formatLoggedAtDate(to)}`;
    return "this date range";
  }
  return "your history";
};

const filterCopy = ({
  query,
  preset,
  from,
  to,
}: Extract<MealsEmptyProps, { kind: "filters" }>): {
  title: string;
  detail: string;
} => {
  const needle = query.trim();
  const range = describeRange(preset, from, to);

  if (needle) {
    return {
      title: `No matches for “${needle}”`,
      detail:
        preset === "all"
          ? "Try another name, or clear the search to see your full history."
          : `Nothing named “${needle}” in ${range}. Widen the dates or clear filters.`,
    };
  }

  if (preset === "today") {
    return {
      title: "Nothing logged today",
      detail: "Log a meal and it’ll show up here. Or show your full history.",
    };
  }
  if (preset === "yesterday") {
    return {
      title: "Yesterday is empty",
      detail: "No meals from yesterday. Show all meals, or log one now.",
    };
  }
  if (preset === "week") {
    return {
      title: "A quiet week",
      detail:
        "No meals in the last 7 days. Log one, or show your full history.",
    };
  }
  if (preset === "custom") {
    let when = "in this date range";
    if (from && to) {
      when = `between ${formatLoggedAtDate(from)} and ${formatLoggedAtDate(to)}`;
    } else if (from) {
      when = `from ${formatLoggedAtDate(from)} onward`;
    } else if (to) {
      when = `through ${formatLoggedAtDate(to)}`;
    }
    return {
      title: "Nothing in this range",
      detail: `No meals ${when}. Pick different dates, or show everything.`,
    };
  }

  return {
    title: "No matching meals",
    detail: "Clear filters to see your full history.",
  };
};

const filterIcon = (query: string): "search-outline" | "calendar-outline" =>
  query.trim() ? "search-outline" : "calendar-outline";

const styles = StyleSheet.create({
  shadow: {
    marginTop: 8,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
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
    opacity: 0.2,
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
  secondary: {
    marginTop: 14,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: {
    color: ACCENT,
    fontSize: 15,
    fontWeight: "700",
  },
});
