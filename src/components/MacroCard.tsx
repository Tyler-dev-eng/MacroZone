import { colors } from "@/styles/global";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

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

const withAlpha = (hex: string, alpha: number): string => {
  const normalized = hex.replace("#", "");
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function MacroCard({
  label,
  current,
  target,
  unit = "",
  color,
  icon,
}: MacroCardProps) {
  const remaining = target - current;
  const isOver = remaining < 0;
  const progress =
    target <= 0 ? (current > 0 ? 1 : 0) : Math.min(current / target, 1);
  const percent =
    target <= 0
      ? current > 0
        ? 100
        : 0
      : Math.round((current / target) * 100);
  const fillColor = isOver ? colors.alert : color;
  const remainingLabel = isOver
    ? `${formatAmount(remaining, unit)} over`
    : `${formatAmount(remaining, unit)} left`;

  const fillWidth = useSharedValue(0);

  useEffect(() => {
    fillWidth.value = withTiming(progress, {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });
  }, [fillWidth, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fillWidth.value * 100}%`,
  }));

  return (
    <View
      style={[styles.shadow, { shadowColor: color }]}
      accessibilityLabel={`${label} ${formatAmount(current, unit)} of ${formatAmount(target, unit)}, ${remainingLabel}`}
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
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: withAlpha(color, 0.28) },
            ]}
          >
            <Ionicons name={icon} size={16} color={color} />
          </View>
          <Text style={[styles.label, { color }]}>{label}</Text>
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

        <Text style={styles.value}>{formatAmount(current, unit)}</Text>
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
          <Animated.View
            style={[styles.fill, { backgroundColor: fillColor }, fillStyle]}
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
    gap: 8,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
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
