import { useCountUp } from "@/hooks/useCountUp";
import { colors } from "@/styles/global";
import { withAlpha } from "@/utils/color";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

type MacroCardProps = {
  label: string;
  current: number;
  target: number;
  unit?: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
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
  icon,
}: MacroCardProps) {
  const displayed = useCountUp(current);
  const remaining = target - displayed;
  const isOver = remaining < 0;
  const progress =
    target <= 0 ? (displayed > 0 ? 1 : 0) : Math.min(displayed / target, 1);
  const percent =
    target <= 0
      ? displayed > 0
        ? 100
        : 0
      : Math.round((displayed / target) * 100);
  const fillColor = isOver ? colors.alert : color;
  const remainingLabel = isOver
    ? `${formatAmount(remaining, unit)} over`
    : `${formatAmount(remaining, unit)} left`;
  const a11yRemaining =
    target - current < 0
      ? `${formatAmount(target - current, unit)} over`
      : `${formatAmount(target - current, unit)} left`;

  return (
    <View
      style={[styles.shadow, { shadowColor: color }]}
      accessibilityLabel={`${label} ${formatAmount(current, unit)} of ${formatAmount(target, unit)}, ${a11yRemaining}`}
    >
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
          <View style={styles.labelGroup}>
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: withAlpha(color, 0.28) },
              ]}
            >
              <Ionicons name={icon} size={16} color={color} />
            </View>
            <Text style={[styles.label, { color }]} numberOfLines={1}>
              {label}
            </Text>
          </View>
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

        <Text style={styles.value}>{formatAmount(displayed, unit)}</Text>
        <Text style={styles.goal}>of {formatAmount(target, unit)}</Text>

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

        <View
          style={styles.track}
          accessibilityRole="progressbar"
          accessibilityValue={{
            min: 0,
            max: 100,
            now: Math.min(percent, 100),
          }}
        >
          <View
            style={[
              styles.fill,
              {
                backgroundColor: fillColor,
                width: `${progress * 100}%`,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    flexGrow: 1,
    flexBasis: "47%",
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
    minHeight: 168,
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
    justifyContent: "space-between",
    gap: 8,
  },
  labelGroup: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  label: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: "700",
  },
  percentChip: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexShrink: 0,
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
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  remaining: {
    fontSize: 12,
    fontWeight: "700",
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    marginTop: 14,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 4,
  },
});
