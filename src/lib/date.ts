/**
 * Date formatting utilities for WorkoutTracker.
 * Standard format across the entire application: "Friday, Oct 2, 2026"
 */

export function formatWorkoutDate(input: string | Date | undefined | null): string {
  if (!input) return "";

  if (input instanceof Date) {
    if (isNaN(input.getTime())) return "";
    return input.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const str = input.trim();
  if (!str) return "";

  // 1. Handle ISO date "YYYY-MM-DD"
  const isoMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
    return dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  // 2. Parse general date strings (e.g. "Oct 2, 2026", "2026/10/02", "Friday, Oct 2, 2026")
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return str;
}

export function getTodayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function workoutDateToIso(str: string | undefined | null): string {
  if (!str) return getTodayIso();
  const isoMatch = str.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) return str.trim();
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  return getTodayIso();
}

export function isSameWorkoutDay(dateA: string | undefined | null, dateB: string | undefined | null): boolean {
  if (!dateA || !dateB) return false;
  const normA = formatWorkoutDate(dateA);
  const normB = formatWorkoutDate(dateB);
  if (normA && normB && normA === normB) return true;

  // Fallback to direct lowercase trim comparison
  return dateA.trim().toLowerCase() === dateB.trim().toLowerCase();
}
