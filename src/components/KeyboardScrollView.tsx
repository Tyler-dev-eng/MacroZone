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

/**
 * Scrolls the focused field above the software keyboard on iOS and Android.
 */
const KeyboardScrollView = forwardRef<ScrollView, ScrollViewProps>(
  function KeyboardScrollView(
    { keyboardShouldPersistTaps = "handled", style, ...props },
    ref,
  ) {
    return (
      <KeyboardAwareScrollView
        ref={ref as Ref<KeyboardAwareScrollViewRef>}
        style={[styles.flex, style]}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        keyboardDismissMode="none"
        bottomOffset={24}
        mode="layout"
        {...props}
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
