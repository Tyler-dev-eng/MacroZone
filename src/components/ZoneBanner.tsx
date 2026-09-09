import { type Meal } from "@/storage/meals";
import { type Targets } from "@/storage/targets";
import { colors } from "@/styles/global";
import { withAlpha } from "@/utils/color";
import { getZoneStatus, sumMealMacros, type ZoneKind } from "@/utils/zone";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

type ZoneBannerProps = {
  meals: Meal[];
  targets: Targets;
};

const KIND_STYLE: Record<
  ZoneKind,
  { color: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  empty: { color: colors.primary, icon: "restaurant-outline" },
  onTrack: { color: colors.primary, icon: "navigate" },
  close: { color: "#ffd93d", icon: "flag" },
  inZone: { color: "#6bcb77", icon: "flash" },
  over: { color: colors.alert, icon: "warning" },
};

export default function ZoneBanner({ meals, targets }: ZoneBannerProps) {
  const status = useMemo(
    () => getZoneStatus(sumMealMacros(meals), targets),
    [meals, targets],
  );
  const tone = KIND_STYLE[status.kind];

  return (
    <View
      style={[styles.shadow, { shadowColor: tone.color }]}
      accessibilityRole="text"
      accessibilityLabel={`${status.title}. ${status.detail}`}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: withAlpha(tone.color, 0.14),
            borderColor: withAlpha(tone.color, 0.38),
          },
        ]}
      >
        <View
          pointerEvents="none"
          style={[styles.blob, { backgroundColor: tone.color }]}
        />
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: withAlpha(tone.color, 0.28) },
          ]}
        >
          <Ionicons name={tone.icon} size={16} color={tone.color} />
        </View>
        <View style={styles.text}>
          <Text style={[styles.title, { color: tone.color }]}>
            {status.title}
          </Text>
          <Text style={styles.detail}>{status.detail}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    marginBottom: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    overflow: "hidden",
    borderWidth: 1,
  },
  blob: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    opacity: 0.22,
    top: -36,
    right: -20,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
  },
  detail: {
    marginTop: 2,
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600",
  },
});
