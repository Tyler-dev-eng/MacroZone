import { colors } from "@/styles/global";
import { Ionicons } from "@expo/vector-icons";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type MealItemProps = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  onPress: () => void;
  onDelete: () => void;
};

export default function MealItem({
  name,
  calories,
  protein,
  carbs,
  fat,
  onPress,
  onDelete,
}: MealItemProps) {
  const confirmDelete = () => {
    Alert.alert("Delete meal?", `"${name}" will be removed.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: onDelete },
    ]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.details} onPress={onPress}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.macros}>
          {calories} cal • {protein}g P • {carbs}g C • {fat}g F
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={confirmDelete} hitSlop={8}>
        <Ionicons name="trash-outline" size={20} color={colors.alert} />
      </TouchableOpacity>
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
