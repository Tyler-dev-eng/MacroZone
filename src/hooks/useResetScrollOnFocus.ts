import { useFocusEffect } from "expo-router";
import { useCallback, useRef } from "react";
import type { ScrollView } from "react-native";

/**
 * Scrolls a screen back to the top when it gains or loses focus so returning
 * to it does not restore the previous offset.
 */
export function useResetScrollOnFocus() {
  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      return () => {
        scrollRef.current?.scrollTo({ y: 0, animated: false });
      };
    }, []),
  );

  return scrollRef;
}
