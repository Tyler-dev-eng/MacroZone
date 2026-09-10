import * as Haptics from "expo-haptics";

const ignoreUnavailable = (): void => {
  // Haptics are unavailable on some simulators, web, and muted devices.
};

/** Light tap used when a meal is logged. */
export const lightImpact = (): void => {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
    ignoreUnavailable,
  );
};

/** Success / warning / error notification used by in-app dialogs. */
export const notifyHaptic = (type: "success" | "warning" | "error"): void => {
  const kind =
    type === "success"
      ? Haptics.NotificationFeedbackType.Success
      : type === "warning"
        ? Haptics.NotificationFeedbackType.Warning
        : Haptics.NotificationFeedbackType.Error;
  void Haptics.notificationAsync(kind).catch(ignoreUnavailable);
};
