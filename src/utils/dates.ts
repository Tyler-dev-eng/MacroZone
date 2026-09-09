/** Local calendar day as YYYY-MM-DD (not UTC). */
export const localDayKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const startOfLocalDay = (date = new Date()): Date => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

export const startOfNextLocalDay = (date = new Date()): Date => {
  const next = startOfLocalDay(date);
  next.setDate(next.getDate() + 1);
  return next;
};

export const daysAgo = (count: number, from = new Date()): Date => {
  const next = startOfLocalDay(from);
  next.setDate(next.getDate() - count);
  return next;
};

export type DatePreset = "all" | "today" | "yesterday" | "week" | "custom";

/** Whether a meal timestamp falls in the selected local-date preset. */
export const matchesDatePreset = (
  isoDate: string,
  preset: DatePreset,
  from: Date | null,
  to: Date | null,
  now = new Date(),
): boolean => {
  const date = new Date(isoDate);

  if (preset === "all") return true;

  if (preset === "today") {
    return localDayKey(date) === localDayKey(now);
  }

  if (preset === "yesterday") {
    return localDayKey(date) === localDayKey(daysAgo(1, now));
  }

  if (preset === "week") {
    return date >= daysAgo(6, now) && date < startOfNextLocalDay(now);
  }

  if (from && date < startOfLocalDay(from)) return false;
  if (to && date >= startOfNextLocalDay(to)) return false;
  return true;
};

/** Friendly label for a meal's local calendar day. */
export const formatHistoryDay = (isoDate: string, now = new Date()): string => {
  const date = new Date(isoDate);
  const todayKey = localDayKey(now);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  const key = localDayKey(date);
  if (key === todayKey) return "Today";
  if (key === localDayKey(yesterday)) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
};
