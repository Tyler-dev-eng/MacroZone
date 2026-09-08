import { colors } from "@/styles/global";
import { formatLoggedAtDate, formatLoggedAtTime } from "@/utils/mealType";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type LoggedAtFieldProps = {
  value: Date;
  onChange: (date: Date) => void;
};

export default function LoggedAtField({ value, onChange }: LoggedAtFieldProps) {
  const [mode, setMode] = useState<"date" | "time" | null>(null);

  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") {
      setMode(null);
      if (event.type !== "set" || !selected || !mode) return;
    }
    if (!selected || !mode) return;

    const next = new Date(value);
    if (mode === "date") {
      next.setFullYear(
        selected.getFullYear(),
        selected.getMonth(),
        selected.getDate(),
      );
    } else {
      next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    }
    onChange(next);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Logged at</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setMode(mode === "date" ? null : "date")}
          accessibilityRole="button"
          accessibilityLabel="Change meal date"
        >
          <Text style={styles.buttonText}>{formatLoggedAtDate(value)}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setMode(mode === "time" ? null : "time")}
          accessibilityRole="button"
          accessibilityLabel="Change meal time"
        >
          <Text style={styles.buttonText}>{formatLoggedAtTime(value)}</Text>
        </TouchableOpacity>
      </View>
      {mode ? (
        <DateTimePicker
          value={value}
          mode={mode}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          themeVariant="dark"
          textColor={colors.text}
          onChange={handleChange}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  button: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 10,
    minHeight: 44,
    justifyContent: "center",
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
  },
});
