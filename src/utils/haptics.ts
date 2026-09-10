import * as Haptics from "expo-haptics";

/** Light tap used when a meal is logged. */
export const lightImpact = (): void => {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
    // Haptics are unavailable on some simulators, web, and muted devices.
  });
};
