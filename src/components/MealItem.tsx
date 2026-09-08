import { colors } from "@/styles/global";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type MealItemProps = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  imageUri?: string | null;
  onPress: () => void;
  onLogAgain?: () => void;
  onDelete?: () => void;
};

export default function MealItem({
  name,
  calories,
  protein,
  carbs,
  fat,
  imageUri,
  onPress,
  onLogAgain,
  onDelete,
}: MealItemProps) {
  const confirmDelete = () => {
    if (!onDelete) return;
    Alert.alert("Delete meal?", `"${name}" will be removed.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: onDelete },
    ]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.details} onPress={onPress}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.thumb}
            contentFit="cover"
            accessibilityLabel={`${name} photo`}
          />
        ) : null}
        <View style={styles.text}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.macros}>
            {calories} cal • {protein}g P • {carbs}g C • {fat}g F
          </Text>
        </View>
      </TouchableOpacity>
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
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#16213e",
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  details: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  text: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  macros: {
    fontSize: 13,
    color: "#a0a0b0",
    marginTop: 4,
  },
});
