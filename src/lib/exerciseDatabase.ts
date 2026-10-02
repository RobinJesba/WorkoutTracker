import wgerExercisesData from "@/data/wger/exercises.json";
import datasetExercisesData from "@/data/exercises-dataset/exercises.json";

export interface UnifiedExercise {
  id: string;
  source: "wger" | "exercises-dataset";
  name: string;
  category: string;
  equipment?: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions?: string[];
}

// Canonical standard muscle names matching our MuscleIcon & app standards
export function normalizeMuscle(muscle: string): string {
  const m = muscle.toLowerCase().trim();

  if (/quad/i.test(m)) return "Quads";
  if (/glute/i.test(m)) return "Glutes";
  if (/hamstring/i.test(m)) return "Hamstrings";
  if (/calf|calves|gastrocnemius|soleus/i.test(m)) return "Calves";
  if (/lat|latissimus/i.test(m)) return "Lats";
  if (/scapula|serratus anterior/i.test(m)) return "Scapula";
  if (/upper back|rhomboid|trapezius|trap|levator/i.test(m)) return "Upper Back";
  if (/lower back|erector/i.test(m)) return "Lower Back";
  if (/pec|chest/i.test(m)) return "Chest";
  if (/delt|shoulder/i.test(m)) return "Shoulders";
  if (/bicep|brachialis/i.test(m)) return "Biceps";
  if (/tricep/i.test(m)) return "Triceps";
  if (/ab|abdominal|oblique|core/i.test(m)) return "Abs";
  if (/forearm|wrist/i.test(m)) return "Forearms";
  if (/hip flexor/i.test(m)) return "Hip Flexors";

  // Capitalize word
  return m.charAt(0).toUpperCase() + m.slice(1);
}

// Build indexed database
export const ALL_EXERCISES: UnifiedExercise[] = [
  ...datasetExercisesData.map((ex) => ({
    id: `ed-${ex.id}`,
    source: "exercises-dataset" as const,
    name: ex.name,
    category: ex.category || ex.bodyPart,
    equipment: ex.equipment,
    primaryMuscles: ex.target ? [normalizeMuscle(ex.target)] : [],
    secondaryMuscles: (ex.secondaryMuscles || []).map(normalizeMuscle),
    instructions: ex.instructions || [],
  })),
  ...wgerExercisesData.map((ex) => ({
    id: `wger-${ex.id}`,
    source: "wger" as const,
    name: ex.name,
    category: ex.category,
    equipment: undefined,
    primaryMuscles: (ex.primaryMuscles || []).map(normalizeMuscle),
    secondaryMuscles: (ex.secondaryMuscles || []).map(normalizeMuscle),
    instructions: undefined,
  })),
];

/**
 * Fast search across the combined 2,190+ exercise database.
 */
export function searchUnifiedExercises(query: string, limit = 10): UnifiedExercise[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const tokens = q.split(/\s+/);

  const scored = ALL_EXERCISES.map((ex) => {
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

/**
 * Find best matching exercise by name.
 */
export function findUnifiedExercise(query: string): UnifiedExercise | undefined {
  const matches = searchUnifiedExercises(query, 1);
  return matches.length > 0 ? matches[0] : undefined;
}
