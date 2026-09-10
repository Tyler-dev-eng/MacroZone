import { useEffect, useRef, useState } from "react";

const easeOutCubic = (t: number): number => 1 - (1 - t) ** 3;

/** Animates a number from its previous value to `target`. */
export const useCountUp = (target: number, duration = 650): number => {
  const [value, setValue] = useState(0);
  const displayedRef = useRef(0);

  useEffect(() => {
    const from = displayedRef.current;
    if (from === target) {
      setValue(target);
      return;
    }

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const next = from + (target - from) * easeOutCubic(t);
      displayedRef.current = next;
      setValue(next);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        displayedRef.current = target;
        setValue(target);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration, target]);

  return value;
};
