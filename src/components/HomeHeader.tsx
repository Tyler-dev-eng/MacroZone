import { colors, globalStyles } from "@/styles/global";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HomeHeader({
  hasMeals,
  onClearAll,
}: {
  hasMeals: boolean;
  onClearAll: () => void;
}) {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const confirmClear = () => {
    Alert.alert("Clear all meals?", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear all", style: "destructive", onPress: onClearAll },
    ]);
  };

  return (
    <View style={globalStyles.header}>
      <Text style={styles.date}>{currentDate}</Text>
      {hasMeals ? (
        <TouchableOpacity onPress={confirmClear} hitSlop={8}>
          <Text style={styles.clear}>Clear all</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  date: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 30,
  },
  clear: {
    fontSize: 14,
    color: colors.alert,
    marginBottom: 26,
  },
});
