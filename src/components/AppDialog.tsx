import { colors } from "@/styles/global";
import { withAlpha } from "@/utils/color";
import { lightImpact, notifyHaptic } from "@/utils/haptics";
import { Ionicons } from "@expo/vector-icons";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type DialogTone = "danger" | "warning" | "info" | "success";

export type DialogAction = {
  label: string;
  role?: "cancel" | "destructive" | "primary";
  onPress?: () => void;
};

export type DialogConfig = {
  title: string;
  message?: string;
  tone?: DialogTone;
  icon?: keyof typeof Ionicons.glyphMap;
  actions?: DialogAction[];
};

type DialogApi = {
  show: (config: DialogConfig) => void;
  hide: () => void;
  notice: (title: string, message?: string, tone?: DialogTone) => void;
  confirm: (options: {
    title: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
    onConfirm: () => void;
  }) => void;
  choose: (options: {
    title: string;
    message?: string;
    options: { label: string; onPress: () => void }[];
  }) => void;
};

const TONE: Record<
  DialogTone,
  { color: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  danger: { color: colors.alert, icon: "warning" },
  warning: { color: "#ffd93d", icon: "alert-circle" },
  info: { color: colors.primary, icon: "information-circle" },
  success: { color: "#6bcb77", icon: "checkmark-circle" },
};

const DialogContext = createContext<DialogApi | null>(null);

/** Themed in-app alerts and confirms — replaces native `Alert.alert`. */
export function DialogProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<DialogConfig | null>(null);
  const insets = useSafeAreaInsets();

  const hide = useCallback(() => setConfig(null), []);

  const show = useCallback((next: DialogConfig) => {
    const tone = next.tone ?? "info";
    if (tone === "danger" || tone === "warning") {
      notifyHaptic("warning");
    } else if (tone === "success") {
      notifyHaptic("success");
    } else {
      lightImpact();
    }
    setConfig(next);
  }, []);

  const api = useMemo<DialogApi>(
    () => ({
      show,
      hide,
      notice: (title, message, tone = "warning") =>
        show({
          title,
          message,
          tone,
          actions: [{ label: "OK", role: "primary" }],
        }),
      confirm: ({
        title,
        message,
        confirmLabel = "Confirm",
        cancelLabel = "Cancel",
        destructive = false,
        onConfirm,
      }) =>
        show({
          title,
          message,
          tone: destructive ? "danger" : "info",
          actions: [
            { label: cancelLabel, role: "cancel" },
            {
              label: confirmLabel,
              role: destructive ? "destructive" : "primary",
              onPress: onConfirm,
            },
          ],
        }),
      choose: ({ title, message, options }) =>
        show({
          title,
          message,
          tone: "info",
          icon: "images-outline",
          actions: [
            ...options.map((option) => ({
              label: option.label,
              role: "primary" as const,
              onPress: option.onPress,
            })),
            { label: "Cancel", role: "cancel" },
          ],
        }),
    }),
    [hide, show],
  );

  const tone = config?.tone ?? "info";
  const meta = TONE[tone];
  const accent = meta.color;
  const actions = config?.actions?.length
    ? config.actions
    : [{ label: "OK", role: "primary" as const }];
  const cancel = actions.find((action) => action.role === "cancel");
  const rest = actions.filter((action) => action.role !== "cancel");
  const paired = Boolean(cancel && rest.length === 1);

  const run = (action: DialogAction) => {
    if (action.role === "destructive") notifyHaptic("error");
    hide();
    action.onPress?.();
  };

  return (
    <DialogContext.Provider value={api}>
      {children}
      <Modal
        visible={config !== null}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={hide}
      >
        <View
          style={[
            styles.root,
            {
              paddingTop: insets.top + 12,
              paddingBottom: Math.max(insets.bottom, 12),
            },
          ]}
        >
          <Pressable
            style={styles.backdrop}
            onPress={hide}
            accessibilityLabel="Dismiss"
          />
          {config ? (
            <View
              style={[styles.shadow, { shadowColor: accent }]}
              accessibilityViewIsModal
              accessibilityRole="alert"
              accessibilityLabel={`${config.title}${config.message ? `. ${config.message}` : ""}`}
            >
              <View
                style={[styles.card, { borderColor: withAlpha(accent, 0.5) }]}
              >
                <View
                  pointerEvents="none"
                  style={[
                    styles.tint,
                    { backgroundColor: withAlpha(accent, 0.22) },
                  ]}
                />
                <View
                  pointerEvents="none"
                  style={[styles.blob, { backgroundColor: accent }]}
                />
                <View
                  style={[
                    styles.iconWrap,
                    { backgroundColor: withAlpha(accent, 0.28) },
                  ]}
                >
                  <Ionicons
                    name={config.icon ?? meta.icon}
                    size={26}
                    color={accent}
                  />
                </View>
                <Text style={[styles.title, { color: accent }]}>
                  {config.title}
                </Text>
                {config.message ? (
                  <Text style={styles.message}>{config.message}</Text>
                ) : null}

                {paired ? (
                  <View style={styles.row}>
                    <TouchableOpacity
                      style={[styles.ghost, styles.flex]}
                      onPress={() => run(cancel!)}
                      accessibilityRole="button"
                      accessibilityLabel={cancel!.label}
                    >
                      <Text style={styles.ghostText}>{cancel!.label}</Text>
                    </TouchableOpacity>
                    <ActionButton
                      action={rest[0]}
                      accent={accent}
                      fill
                      onPress={run}
                    />
                  </View>
                ) : (
                  <View style={styles.stack}>
                    {rest.map((action) => (
                      <ActionButton
                        key={action.label}
                        action={action}
                        accent={accent}
                        stacked={rest.length > 1}
                        onPress={run}
                      />
                    ))}
                    {cancel ? (
                      <TouchableOpacity
                        style={styles.ghost}
                        onPress={() => run(cancel)}
                        accessibilityRole="button"
                        accessibilityLabel={cancel.label}
                      >
                        <Text style={styles.ghostText}>{cancel.label}</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                )}
              </View>
            </View>
          ) : null}
        </View>
      </Modal>
    </DialogContext.Provider>
  );
}

export const useDialog = (): DialogApi => {
  const value = useContext(DialogContext);
  if (!value) {
    throw new Error("useDialog must be used within DialogProvider");
  }
  return value;
};

function ActionButton({
  action,
  accent,
  stacked = false,
  fill = false,
  onPress,
}: {
  action: DialogAction;
  accent: string;
  stacked?: boolean;
  fill?: boolean;
  onPress: (action: DialogAction) => void;
}) {
  const destructive = action.role === "destructive";
  const option = stacked && !destructive;

  return (
    <TouchableOpacity
      style={[
        option
          ? styles.option
          : [
              styles.solid,
              { backgroundColor: destructive ? colors.alert : accent },
            ],
        fill ? styles.flex : null,
      ]}
      onPress={() => onPress(action)}
      accessibilityRole="button"
      accessibilityLabel={action.label}
    >
      <Text
        style={
          option
            ? styles.optionText
            : [styles.solidText, destructive ? styles.solidOnAlert : null]
        }
      >
        {action.label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(10, 10, 22, 0.9)",
  },
  shadow: {
    alignSelf: "stretch",
    zIndex: 1,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 16,
  },
  card: {
    borderRadius: 22,
    padding: 22,
    overflow: "hidden",
    borderWidth: 1,
    backgroundColor: colors.background,
  },
  tint: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  blob: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    opacity: 0.22,
    top: -56,
    right: -40,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginTop: 14,
    fontSize: 22,
    fontWeight: "800",
  },
  message: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 21,
    color: colors.text,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  stack: {
    gap: 10,
    marginTop: 20,
  },
  solid: {
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  solidText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "800",
  },
  ghost: {
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: withAlpha(colors.text, 0.1),
  },
  ghostText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  option: {
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: withAlpha(colors.text, 0.1),
  },
  optionText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  flex: {
    flex: 1,
  },
  solidOnAlert: {
    color: colors.text,
  },
});
