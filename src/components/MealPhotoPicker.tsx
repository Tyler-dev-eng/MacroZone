import { colors } from "@/styles/global";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type MealPhotoPickerProps = {
  uri: string | null;
  onChange: (uri: string | null) => void;
};

const pickerOptions: ImagePicker.ImagePickerOptions = {
  mediaTypes: ["images"],
  allowsEditing: true,
  aspect: [4, 3],
  quality: 0.8,
};

export default function MealPhotoPicker({
  uri,
  onChange,
}: MealPhotoPickerProps) {
  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Camera access is needed to photograph a meal.",
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync(pickerOptions);
      if (!result.canceled) {
        onChange(result.assets[0].uri);
      }
    } catch {
      Alert.alert(
        "Couldn't open camera",
        "Try a physical device, or choose a file instead.",
      );
    }
  };

  const pickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Photo library access is needed to attach a meal photo.",
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
      if (!result.canceled) {
        onChange(result.assets[0].uri);
      }
    } catch {
      Alert.alert("Couldn't open photos", "Something went wrong. Try again.");
    }
  };

  const pickFromFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/*",
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled) {
        onChange(result.assets[0].uri);
      }
    } catch {
      Alert.alert("Couldn't open files", "Something went wrong. Try again.");
    }
  };

  const chooseFile = () => {
    Alert.alert("Choose a photo", undefined, [
      { text: "Photo library", onPress: () => void pickFromLibrary() },
      { text: "Files", onPress: () => void pickFromFiles() },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.previewWrap}>
        {uri ? (
          <Image
            source={{ uri }}
            style={styles.preview}
            contentFit="cover"
            accessibilityLabel="Meal photo"
          />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons
              name="camera-outline"
              size={32}
              color={colors.textSecondary}
            />
            <Text style={styles.placeholderText}>No photo yet</Text>
          </View>
        )}
        {uri ? (
          <TouchableOpacity
            style={styles.remove}
            onPress={() => onChange(null)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Remove photo"
          >
            <Ionicons name="close" size={16} color={colors.text} />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.action}
          onPress={() => void takePhoto()}
          accessibilityRole="button"
          accessibilityLabel="Take a picture"
        >
          <Ionicons name="camera" size={18} color={colors.primary} />
          <Text style={styles.actionText}>Take photo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.action}
          onPress={chooseFile}
          accessibilityRole="button"
          accessibilityLabel="Choose a photo from files"
        >
          <Ionicons name="folder-open" size={18} color={colors.primary} />
          <Text style={styles.actionText}>Choose file</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  previewWrap: {
    position: "relative",
  },
  preview: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  placeholder: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  placeholderText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  remove: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  action: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.surface,
    paddingVertical: 12,
    borderRadius: 10,
    minHeight: 44,
  },
  actionText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
});
