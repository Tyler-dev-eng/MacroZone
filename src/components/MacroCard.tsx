import { colors } from "@/styles/global";
import { StyleSheet, Text, View } from "react-native";

type MacroCardProps = {
  label: string;
  current: number;
  target: number;
  unit?: string;
  color: string;
};

const formatAmount = (value: number, unit: string): string => {
  const abs = Math.abs(value);
  if (unit) {
    const rounded = Number.isInteger(abs)
      ? String(abs)
      : String(Number(abs.toFixed(1)));
    return `${rounded}${unit}`;
  }
  return Math.round(abs).toLocaleString("en-US");
};

export default function MacroCard({
  label,
  current,
  target,
  unit = "",
  color,
}: MacroCardProps) {
  const remaining = target - current;
  const isOver = remaining < 0;
  const progress =
    target <= 0 ? (current > 0 ? 1 : 0) : Math.min(current / target, 1);
  const fillColor = isOver ? colors.alert : color;
  const remainingLabel = isOver
    ? `${formatAmount(remaining, unit)} over`
    : `${formatAmount(remaining, unit)} left`;

  return (
    <View
      style={[styles.card, { borderLeftColor: color }]}
      accessibilityLabel={`${label} ${formatAmount(current, unit)} of ${formatAmount(target, unit)}, ${remainingLabel}`}
    >
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{formatAmount(current, unit)}</Text>
      <Text style={styles.goal}>/ {formatAmount(target, unit)}</Text>
      <Text style={[styles.remaining, isOver && styles.over]}>
        {remainingLabel}
      </Text>
      <View
        style={styles.track}
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 0,
          max: 100,
          now: Math.round(progress * 100),
        }}
      >
        <View
          style={[
            styles.fill,
            { width: `${progress * 100}%`, backgroundColor: fillColor },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#16213e",
    borderRadius: 12,
    padding: 16,
    width: "47%",
    borderLeftWidth: 4,
  },
  label: {
    fontSize: 14,
    color: "#a0a0b0",
  },
  value: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 4,
  },
  goal: {
    fontSize: 14,
    color: "#a0a0b0",
    marginTop: 2,
  },
  remaining: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 6,
    fontWeight: "600",
  },
  over: {
    color: colors.alert,
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginTop: 12,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 3,
  },
});
