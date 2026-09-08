import { Directory, File, Paths } from "expo-file-system";

const MEAL_IMAGES_DIR = "meal-images";

const getMealImagesDir = (): Directory => {
  return new Directory(Paths.document, MEAL_IMAGES_DIR);
};

const getExtension = (uri: string): string => {
  const match = uri.split("?")[0]?.match(/(\.[a-zA-Z0-9]+)$/);
  return match?.[1] ?? ".jpg";
};

/**
 * Copies a picked or captured photo into app document storage so it survives
 * cache cleanup. Returns the persistent file URI.
 */
export const persistMealImage = (sourceUri: string, mealId: string): string => {
  const dir = getMealImagesDir();
  if (!dir.exists) {
    dir.create();
  }

  const dest = new File(dir, `${mealId}${getExtension(sourceUri)}`);
  if (sourceUri === dest.uri) {
    return dest.uri;
  }
  if (dest.exists) {
    dest.delete();
  }

  new File(sourceUri).copy(dest);
  return dest.uri;
};

/** Deletes a persisted meal photo if the file still exists. */
export const deleteMealImageFile = (uri: string | null | undefined): void => {
  if (!uri) return;

  try {
    const file = new File(uri);
    if (file.exists) {
      file.delete();
    }
  } catch {
    // File may already be gone; ignore.
  }
};

/** Removes the meal-images directory and everything in it. */
export const deleteAllMealImageFiles = (): void => {
  const dir = getMealImagesDir();
  if (dir.exists) {
    dir.delete();
  }
};
