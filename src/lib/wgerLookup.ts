import exercisesData from "@/data/wger/exercises.json";
import musclesData from "@/data/wger/muscles.json";
import categoriesData from "@/data/wger/categories.json";

export interface WgerExercise {
  id: number;
  name: string;
  category: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
}

export interface WgerMuscle {
  id: number;
  name: string;
  latinName: string;
  isFront: boolean;
}

export interface WgerCategory {
  id: number;
  name: string;
}

export const WGER_MUSCLES: WgerMuscle[] = musclesData as WgerMuscle[];
export const WGER_CATEGORIES: WgerCategory[] = categoriesData as WgerCategory[];
export const WGER_EXERCISES: WgerExercise[] = exercisesData as WgerExercise[];

// Fast lookup maps
const exerciseMapByName = new Map<string, WgerExercise>();
for (const ex of WGER_EXERCISES) {
  exerciseMapByName.set(ex.name.toLowerCase(), ex);
}

/**
 * Find exact or fuzzy matching exercise from wger database.
 */
export function findExercise(query: string): WgerExercise | undefined {
  const normalized = query.toLowerCase().trim();

  // 1. Exact match
  if (exerciseMapByName.has(normalized)) {
    return exerciseMapByName.get(normalized);
  }

  // 2. Substring match
  const match = WGER_EXERCISES.find((ex) => {
    const exName = ex.name.toLowerCase();
    return exName.includes(normalized) || normalized.includes(exName);
  });

  return match;
}

/**
 * Search exercises by keyword with ranking.
 */
export function searchExercises(query: string, limit = 10): WgerExercise[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const tokens = q.split(/\s+/);

  const scored = WGER_EXERCISES.map((ex) => {
    const name = ex.name.toLowerCase();
    let score = 0;

    if (name === q) score += 100;
    else if (name.startsWith(q)) score += 50;
    else if (name.includes(q)) score += 30;

    for (const token of tokens) {
      if (name.includes(token)) score += 10;
    }

    return { ex, score };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.ex);

  return scored;
}
