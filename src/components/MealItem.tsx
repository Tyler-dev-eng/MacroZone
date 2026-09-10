import { useDialog } from "@/components/AppDialog";
import MealTypeBadge from "@/components/MealTypeBadge";
import { colors } from "@/styles/global";
import { withAlpha } from "@/utils/color";
import {
  formatLoggedAtTime,
  MEAL_TYPE_META,
  normalizeMealType,
} from "@/utils/mealType";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type MealItemProps = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  imageUri?: string | null;
  mealType?: string | null;
  createdAt?: string | null;
  onPress: () => void;
  onLogAgain?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onDelete?: () => void;
};

export default function MealItem({
  name,
  calories,
  protein,
  carbs,
  fat,
  imageUri,
  mealType,
  createdAt,
  onPress,
  onLogAgain,
  isFavorite = false,
  onToggleFavorite,
  onDelete,
}: MealItemProps) {
  const dialog = useDialog();
  const type = mealType ? normalizeMealType(mealType) : null;
  const meta = type ? MEAL_TYPE_META[type] : null;

  const confirmDelete = () => {
    if (!onDelete) return;
    dialog.confirm({
      title: "Delete meal?",
      message: `“${name}” will be removed.`,
      confirmLabel: "Delete",
      destructive: true,
      onConfirm: onDelete,
    });
  };

  return (
    <View
      style={[styles.shadow, { shadowColor: meta?.color ?? colors.surface }]}
    >
      <View
        style={[
          styles.container,
          meta
            ? {
                backgroundColor: withAlpha(meta.color, 0.14),
                borderColor: withAlpha(meta.color, 0.38),
              }
            : styles.neutral,
        ]}
      >
        <TouchableOpacity style={styles.details} onPress={onPress}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.thumb}
              contentFit="cover"
              accessibilityLabel={`${name} photo`}
            />
          ) : (
            <View
              style={[
                styles.thumb,
                styles.thumbPlaceholder,
                meta ? { backgroundColor: withAlpha(meta.color, 0.28) } : null,
              ]}
            >
              <Ionicons
                name={meta?.icon ?? "restaurant"}
                size={18}
                color={meta?.color ?? colors.textSecondary}
              />
            </View>
          )}
          <View style={styles.text}>
            <Text style={styles.name}>{name}</Text>
            <View style={styles.metaRow}>
              {mealType ? <MealTypeBadge type={mealType} /> : null}
              {createdAt ? (
                <Text style={styles.time}>{formatLoggedAtTime(createdAt)}</Text>
              ) : null}
            </View>
            <Text style={styles.macros} numberOfLines={1}>
              {calories} cal · {protein}P · {carbs}C · {fat}F
            </Text>
          </View>
        </TouchableOpacity>
        <View style={styles.actions}>
          {onToggleFavorite ? (
            <TouchableOpacity
              onPress={onToggleFavorite}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={
                isFavorite
                  ? `Remove ${name} from favorites`
                  : `Save ${name} as favorite`
              }
            >
              <Ionicons
                name={isFavorite ? "star" : "star-outline"}
                size={20}
                color={isFavorite ? colors.primary : colors.textSecondary}
              />
            </TouchableOpacity>
          ) : null}
          {onLogAgain ? (
            <TouchableOpacity
              onPress={onLogAgain}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Log ${name} again`}
            >
              <Ionicons name="copy-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          ) : null}
          {onDelete ? (
            <TouchableOpacity
              onPress={confirmDelete}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Delete ${name}`}
            >
              <Ionicons name="trash-outline" size={20} color={colors.alert} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    marginBottom: 10,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 5,
  },
  container: {
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  neutral: {
    backgroundColor: "#16213e",
    borderColor: colors.surface,
  },
  details: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 44,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  thumbPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  time: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  macros: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
});
