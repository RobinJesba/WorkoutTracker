import wgerExercisesData from "@/data/wger/exercises.json";
import datasetExercisesData from "@/data/exercises-dataset/exercises.json";
import { CANONICAL_EXERCISES, findCanonicalExercise } from "@/data/canonicalExercises";

export interface UnifiedExercise {
  id: string;
  source: "wger" | "exercises-dataset" | "canonical";
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

// Capitalize exercise names properly into Title Case
export function toTitleCase(str: string): string {
  if (!str) return "";
  return str.replace(/\b[a-z]/g, (char) => char.toUpperCase());
}

// Build indexed database with canonical fundamentals prioritized first
export const ALL_EXERCISES: UnifiedExercise[] = [
  ...CANONICAL_EXERCISES.map((c) => ({
    id: `canonical-${c.canonicalName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
    source: "canonical" as const,
    name: c.canonicalName,
    category: c.muscleGroup,
    equipment: undefined,
    primaryMuscles: c.primaryMuscles,
    secondaryMuscles: c.secondaryMuscles,
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
  ...datasetExercisesData.map((ex) => ({
    id: `ed-${ex.id}`,
    source: "exercises-dataset" as const,
    name: toTitleCase(ex.name),
    category: ex.category || ex.bodyPart,
    equipment: ex.equipment,
    primaryMuscles: ex.target ? [normalizeMuscle(ex.target)] : [],
    secondaryMuscles: (ex.secondaryMuscles || []).map(normalizeMuscle),
    instructions: ex.instructions || [],
  })),
];

const QUERY_STOP_WORDS = new Set([
  "for", "with", "at", "and", "the", "a", "an", "on", "in", "to", "of",
  "mins", "min", "minutes", "minute", "hr", "hrs", "hour", "hours", "sec", "secs", "seconds",
  "km", "km/h", "km/hr", "kmh", "mph", "reps", "rep", "sets", "set", "speed", "level"
]);

function extractQueryTokens(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[\s,–—:>]+/)
    .map((t) => t.replace(/[^a-z0-9]/g, ""))
    .filter(
      (t) =>
        t.length > 0 &&
        !QUERY_STOP_WORDS.has(t) &&
        !/^\d+(\.\d+)?(km|kmh|mph|min|mins|kg|lbs|%)?$/.test(t)
    );
}

/**
 * Fast search across the combined exercise database with anti-collision movement rules.
 */
export function searchUnifiedExercises(query: string, limit = 10): UnifiedExercise[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  // 1. Direct canonical check
  const canonical = findCanonicalExercise(q);
  if (canonical) {
    const canonicalMatch: UnifiedExercise = {
      id: `canonical-${canonical.canonicalName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
      source: "canonical",
      name: canonical.canonicalName,
      category: canonical.muscleGroup,
      equipment: undefined,
      primaryMuscles: canonical.primaryMuscles,
      secondaryMuscles: canonical.secondaryMuscles,
    };
    return [canonicalMatch];
  }

  const queryTokens = extractQueryTokens(q);
  const qNorm = q.replace(/[^a-z0-9]/g, "");

  // Movement category intention in query
  const qHasSquat = /\bsquats?\b/i.test(q);
  const qHasLunge = /\blunges?\b/i.test(q);
  const qHasDeadlift = /\bdeadlifts?\b|\brdl\b/i.test(q);
  const qHasPress = /\bpress(es)?\b|\bpush-?ups?\b|\bdips?\b/i.test(q);
  const qHasPull = /\bpulls?\b|\bpulldowns?\b|\brows?\b|\bchin-?ups?\b/i.test(q);
  const qHasTreadmill = /\btreadmill\b/i.test(q);
  const qHasCardio = /\b(treadmill|walk|walking|walks|run|running|runs|jog|jogging|sprint|sprints|cardio|climber|stair|stepper|elliptical|cycling|bike)\b/i.test(q);
  const qHasIncline = /\bincline\b/i.test(q);

  const scored = ALL_EXERCISES.map((ex) => {
    const name = ex.name.toLowerCase();
    const nameNorm = name.replace(/[^a-z0-9]/g, "");
    let score = 0;

    // Exact matches
    if (name === q) score += 300;
    else if (nameNorm === qNorm) score += 280;
    else if (name.startsWith(q + " ") || name.startsWith(q + "-")) score += 120;
    else if (name.includes(q)) score += 60;

    // Token matches with whole-word matching
    let matchedTokens = 0;
    for (const token of queryTokens) {
      const regex = new RegExp(`\\b${token}\\b`, "i");
      if (regex.test(name)) {
        score += 25;
        matchedTokens++;
      } else if (name.includes(token) && token.length >= 4) {
        score += 10;
      }
    }

    // Critical: If candidate has 0 matched tokens and is NOT an exact/prefix/substring match,
    // it has zero relevance to the query. Never award scores or canonical bonuses!
    const hasNameMatch = score > 0;
    if (matchedTokens === 0 && !hasNameMatch) {
      return { ex, score: 0 };
    }

    // Canonical source bonus (only for actual matches)
    if (ex.id.startsWith("canonical-")) score += 80;

    if (matchedTokens === queryTokens.length && queryTokens.length > 0) {
      score += 40; // All query words matched exactly
    }

    // Word count / length penalty (prevents matching 2-word query to 5-word compound)
    const nameWords = name.split(/\s+/);
    const lengthDiff = Math.abs(nameWords.length - queryTokens.length);
    score -= lengthDiff * 6;

    // Incline alignment
    if (qHasIncline) {
      if (/\bincline\b/i.test(name)) score += 60;
      else score -= 40;
    }

    // Treadmill alignment
    if (qHasTreadmill) {
      if (/\btreadmill\b/i.test(name)) score += 150;
      else score -= 200;
    }

    // Critical: If candidate is a LUNGE, but query does NOT specify lunge, heavily penalize
    if (!qHasLunge && /\blunges?\b/i.test(name)) {
      score -= 350;
    }

    // Movement collision anti-patterns
    // 1. If searching for CARDIO, heavily penalize PRESS, SQUAT, DEADLIFT, ROW
    if (qHasCardio) {
      if (!qHasPress && /\b(press(es)?|bench|push-?ups?|dips?)\b/i.test(name)) score -= 400;
      if (!qHasSquat && /\bsquats?\b/i.test(name)) score -= 400;
      if (!qHasDeadlift && /\b(deadlifts?|rdl)\b/i.test(name)) score -= 400;
      if (!qHasPull && /\b(row|rows|rowing|pulldown|pulldowns|chin-?ups?|pull-?ups?)\b/i.test(name)) score -= 400;
    }

    // 2. If searching for SQUAT, heavily penalize exercises with ROW, CURL, PRESS, JERK
    if (qHasSquat) {
      if (/\brow(ing|s)?\b/i.test(name)) score -= 300;
      if (/\bjerk\b/i.test(name)) score -= 200;
      if (/\bcurl(s)?\b/i.test(name)) score -= 250;
      if (/\bpress(es)?\b/i.test(name) && !/\bsquat\s+press\b/i.test(name)) score -= 150;
      // Squat must NOT have back or chest as primary
      if (ex.primaryMuscles.includes("Upper Back") || ex.primaryMuscles.includes("Lats") || ex.primaryMuscles.includes("Chest")) {
        score -= 400;
      }
    }

    // 3. If searching for LUNGE, penalize ROW, CURL, PRESS
    if (qHasLunge) {
      if (/\brow(ing|s)?\b/i.test(name)) score -= 300;
      if (/\bcurl(s)?\b/i.test(name)) score -= 250;
      if (ex.primaryMuscles.includes("Upper Back") || ex.primaryMuscles.includes("Lats") || ex.primaryMuscles.includes("Chest")) {
        score -= 400;
      }
    }

    // 4. If searching for PRESS / PUSH, penalize PULL / ROW
    if (qHasPress && !qHasPull) {
      if (/\brow(ing|s)?\b|\bpulldowns?\b/i.test(name)) score -= 300;
    }

    // 5. If searching for PULL / ROW, penalize PRESS / PUSH
    if (qHasPull && !qHasPress) {
      if (/\bpress(es)?\b|\bpush-?ups?\b/i.test(name)) score -= 300;
    }

    // 6. If searching for DEADLIFT, must not be bicep/tricep/chest
    if (qHasDeadlift) {
      if (ex.primaryMuscles.includes("Chest") || ex.primaryMuscles.includes("Biceps") || ex.primaryMuscles.includes("Triceps")) {
        score -= 400;
      }
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
  if (!query) return undefined;

  // 1. Direct canonical check
  const canonical = findCanonicalExercise(query);
  if (canonical) {
    return {
      id: `canonical-${canonical.canonicalName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
      source: "canonical",
      name: canonical.canonicalName,
      category: canonical.muscleGroup,
      equipment: undefined,
      primaryMuscles: canonical.primaryMuscles,
      secondaryMuscles: canonical.secondaryMuscles,
    };
  }

  const matches = searchUnifiedExercises(query, 1);
  return matches.length > 0 ? matches[0] : undefined;
}
