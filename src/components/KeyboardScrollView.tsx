import { colors } from "@/styles/global";
import { forwardRef, type Ref } from "react";
import {
  type ScrollView,
  type ScrollViewProps,
  StyleSheet,
} from "react-native";
import {
  KeyboardAwareScrollView,
  type KeyboardAwareScrollViewRef,
} from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DEFAULT_BOTTOM_PADDING = 24;

/**
 * Scrolls the focused field above the software keyboard on iOS and Android,
 * including enough extra space to clear the system navigation bar.
 */
const KeyboardScrollView = forwardRef<ScrollView, ScrollViewProps>(
  function KeyboardScrollView(
    {
      keyboardShouldPersistTaps = "handled",
      style,
      contentContainerStyle,
      ...props
    },
    ref,
  ) {
    const { bottom } = useSafeAreaInsets();
    const flatStyle = StyleSheet.flatten(contentContainerStyle);
    const paddingBottom =
      (typeof flatStyle?.paddingBottom === "number"
        ? flatStyle.paddingBottom
        : DEFAULT_BOTTOM_PADDING) + bottom;

    return (
      <KeyboardAwareScrollView
        ref={ref as Ref<KeyboardAwareScrollViewRef>}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        keyboardDismissMode="none"
        {...props}
        style={[styles.flex, style]}
        contentContainerStyle={[contentContainerStyle, { paddingBottom }]}
        bottomOffset={24 + bottom}
        extraKeyboardSpace={bottom}
        mode="layout"
      />
    );
  },
);

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export default KeyboardScrollView;
