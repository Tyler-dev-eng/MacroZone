import { globalStyles } from "@/styles/global";
import { Link } from "expo-router";
import { ScrollView, Text } from "react-native";

export default function MealsScreen() {
  return (
    <ScrollView style={globalStyles.container}>
      <Text style={globalStyles.title}>All Meals</Text>
      <Link href="/add-meals" style={{ fontSize: 18, color: "#007bff" }}>
        Add Meal
      </Link>
    </ScrollView>
  );
}
