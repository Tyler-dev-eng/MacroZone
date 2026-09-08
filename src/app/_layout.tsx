import { db } from "@/db";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { Stack } from "expo-router";
import { Text, View } from "react-native";
import migrations from "../../drizzle/migrations";

export default function RootLayout() {
  // Runs drizzle/*.sql against the device DB on launch (CREATE TABLE, later ALTERs).
  // Don't render the app until this finishes — queries would fail if the table doesn't exist yet.
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Migration error: {error.message}</Text>
      </View>
    );
  }

  if (!success) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
