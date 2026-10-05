import { MuscleGroup } from "@/components/MuscleIcon";

export interface CanonicalExercise {
  canonicalName: string;
  aliases: string[];
  muscleGroup: MuscleGroup;
  primaryMuscles: string[];
  secondaryMuscles: string[];
}

export const CANONICAL_EXERCISES: CanonicalExercise[] = [
  // --- SQUATS & LOWER BODY ---
  {
    canonicalName: "Bodyweight Squats",
    aliases: [
      "bodyweight squat",
      "bodyweight squats",
      "body weight squat",
      "body weight squats",
      "squat",
      "squats",
      "air squat",
      "air squats",
      "bw squat",
      "bw squats",
      "deep squat",
      "deep squats",
    ],
    muscleGroup: "quads",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Calves", "Core"],
  },
  {
    canonicalName: "Barbell Squats",
    aliases: [
      "barbell squat",
      "barbell squats",
      "barbell back squat",
      "barbell back squats",
      "back squat",
      "back squats",
      "bb squat",
      "bb squats",
    ],
    muscleGroup: "quads",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Lower Back", "Calves", "Core"],
  },
  {
    canonicalName: "Front Squats",
    aliases: [
      "front squat",
      "front squats",
      "barbell front squat",
      "barbell front squats",
      "bb front squat",
    ],
    muscleGroup: "quads",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Upper Back", "Core", "Calves"],
  },
  {
    canonicalName: "Goblet Squats",
    aliases: [
      "goblet squat",
      "goblet squats",
      "dumbbell goblet squat",
      "kettlebell goblet squat",
      "db goblet squat",
      "kb goblet squat",
    ],
    muscleGroup: "quads",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Calves", "Core"],
  },
  {
    canonicalName: "Dumbbell Squat",
    aliases: [
      "dumbbell squat",
      "dumbbell squats",
      "db squat",
      "db squats",
      "dumbbell back squat",
      "dumbbell front squat",
      "db front squat",
    ],
    muscleGroup: "quads",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Calves", "Core"],
  },
  {
    canonicalName: "Bulgarian Split Squats",
    aliases: [
      "bulgarian split squat",
      "bulgarian split squats",
      "bulgarian squat",
      "bulgarian squats",
      "split squat",
      "split squats",
      "rear foot elevated split squat",
    ],
    muscleGroup: "quads",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Calves", "Core"],
  },
  {
    canonicalName: "Walking Lunges",
    aliases: [
      "lunge",
      "lunges",
      "walking lunge",
      "walking lunges",
      "forward lunge",
      "forward lunges",
      "reverse lunge",
      "reverse lunges",
      "dumbbell lunges",
      "bodyweight lunges",
    ],
    muscleGroup: "quads",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Calves"],
  },
  {
    canonicalName: "Deadlifts",
    aliases: [
      "deadlift",
      "deadlifts",
      "barbell deadlift",
      "barbell deadlifts",
      "conventional deadlift",
      "bb deadlift",
    ],
    muscleGroup: "legs",
    primaryMuscles: ["Hamstrings", "Glutes", "Lower Back"],
    secondaryMuscles: ["Upper Back", "Lats", "Forearms", "Core"],
  },
  {
    canonicalName: "Romanian Deadlifts",
    aliases: [
      "romanian deadlift",
      "romanian deadlifts",
      "rdl",
      "rdls",
      "dumbbell rdl",
      "db rdl",
      "barbell rdl",
      "stiff leg deadlift",
      "stiff-leg deadlift",
    ],
    muscleGroup: "legs",
    primaryMuscles: ["Hamstrings", "Glutes"],
    secondaryMuscles: ["Lower Back", "Forearms", "Core"],
  },
  {
    canonicalName: "Leg Press",
    aliases: ["leg press", "leg presses", "45 degree leg press", "machine leg press"],
    muscleGroup: "quads",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Calves"],
  },
  {
    canonicalName: "Leg Extensions",
    aliases: ["leg extension", "leg extensions", "quad extension", "seated leg extension"],
    muscleGroup: "quads",
    primaryMuscles: ["Quads"],
    secondaryMuscles: [],
  },
  {
    canonicalName: "Leg Curls",
    aliases: ["leg curl", "leg curls", "hamstring curl", "hamstring curls", "lying leg curl", "seated leg curl"],
    muscleGroup: "legs",
    primaryMuscles: ["Hamstrings"],
    secondaryMuscles: ["Calves"],
  },
  {
    canonicalName: "Calf Raises",
    aliases: ["calf raise", "calf raises", "standing calf raise", "seated calf raise", "donkey calf raise"],
    muscleGroup: "calves",
    primaryMuscles: ["Calves"],
    secondaryMuscles: [],
  },

  // --- CHEST & UPPER PUSH ---
  {
    canonicalName: "Push-ups",
    aliases: [
      "pushup",
      "pushups",
      "push-up",
      "push-ups",
      "standard pushup",
      "bodyweight pushup",
      "floor pushup",
    ],
    muscleGroup: "chest",
    primaryMuscles: ["Chest"],
    secondaryMuscles: ["Triceps", "Shoulders", "Core"],
  },
  {
    canonicalName: "Scapula Push-ups",
    aliases: [
      "scapula pushup",
      "scapula pushups",
      "scapula push-up",
      "scapula push-ups",
      "scap pushup",
      "scap pushups",
      "scapular pushups",
    ],
    muscleGroup: "chest",
    primaryMuscles: ["Scapula"],
    secondaryMuscles: ["Triceps", "Shoulders", "Core"],
  },
  {
    canonicalName: "Bench Press",
    aliases: [
      "bench press",
      "barbell bench press",
      "bb bench press",
      "flat bench press",
      "barbell chest press",
    ],
    muscleGroup: "chest",
    primaryMuscles: ["Chest"],
    secondaryMuscles: ["Triceps", "Shoulders"],
  },
  {
    canonicalName: "Dumbbell Chest Press",
    aliases: [
      "dumbbell chest press",
      "dumbbell press",
      "db chest press",
      "dumbbell bench press",
      "db bench press",
      "flat dumbbell press",
    ],
    muscleGroup: "chest",
    primaryMuscles: ["Chest"],
    secondaryMuscles: ["Triceps", "Shoulders"],
  },
  {
    canonicalName: "Incline Dumbbell Bench Press",
    aliases: [
      "incline dumbbell press",
      "incline db press",
      "incline dumbbell chest press",
      "incline bench press",
      "incline barbell bench press",
    ],
    muscleGroup: "chest",
    primaryMuscles: ["Chest"],
    secondaryMuscles: ["Shoulders", "Triceps"],
  },
  {
    canonicalName: "Chest Dips",
    aliases: ["dip", "dips", "chest dip", "chest dips", "parallel bar dips", "bodyweight dips"],
    muscleGroup: "chest",
    primaryMuscles: ["Chest", "Triceps"],
    secondaryMuscles: ["Shoulders"],
  },
  {
    canonicalName: "Chest Flyes",
    aliases: ["chest fly", "chest flye", "dumbbell fly", "dumbbell flyes", "cable fly", "cable flyes", "pec deck"],
    muscleGroup: "chest",
    primaryMuscles: ["Chest"],
    secondaryMuscles: ["Shoulders"],
  },

  // --- BACK & UPPER PULL ---
  {
    canonicalName: "Pull-ups",
    aliases: [
      "pullup",
      "pullups",
      "pull-up",
      "pull-ups",
      "wide grip pullup",
      "bodyweight pullup",
    ],
    muscleGroup: "back",
    primaryMuscles: ["Lats"],
    secondaryMuscles: ["Biceps", "Upper Back", "Forearms"],
  },
  {
    canonicalName: "Chin-ups",
    aliases: ["chinup", "chinups", "chin-up", "chin-ups", "underhand pullup"],
    muscleGroup: "back",
    primaryMuscles: ["Lats", "Biceps"],
    secondaryMuscles: ["Upper Back", "Forearms"],
  },
  {
    canonicalName: "Scapula Pull-ups",
    aliases: [
      "scapula pullup",
      "scapula pullups",
      "scapula pull-up",
      "scapula pull-ups",
      "scap pullup",
      "scap pullups",
      "scapular pullups",
    ],
    muscleGroup: "back",
    primaryMuscles: ["Scapula"],
    secondaryMuscles: ["Lats", "Upper Back", "Forearms"],
  },
  {
    canonicalName: "Lat Pulldowns",
    aliases: [
      "lat pulldown",
      "lat pulldowns",
      "cable lat pulldown",
      "front lat pulldown",
      "wide grip lat pulldown",
    ],
    muscleGroup: "back",
    primaryMuscles: ["Lats"],
    secondaryMuscles: ["Biceps", "Upper Back", "Forearms"],
  },
  {
    canonicalName: "Single Arm Lat Pulldown",
    aliases: [
      "single arm lat pulldown",
      "single arm pulldown",
      "one arm lat pulldown",
      "single-arm kneeling cable lat pulldown",
      "kneeling lat pulldown",
    ],
    muscleGroup: "back",
    primaryMuscles: ["Lats"],
    secondaryMuscles: ["Biceps", "Upper Back"],
  },
  {
    canonicalName: "Bent-Over Barbell Rows",
    aliases: ["barbell row", "barbell rows", "bent over row", "bb row", "pendlay row"],
    muscleGroup: "back",
    primaryMuscles: ["Upper Back", "Lats"],
    secondaryMuscles: ["Biceps", "Lower Back", "Forearms"],
  },
  {
    canonicalName: "Single Arm Dumbbell Row",
    aliases: [
      "single arm dumbbell row",
      "dumbbell row",
      "db row",
      "one arm dumbbell row",
      "single arm db row",
    ],
    muscleGroup: "back",
    primaryMuscles: ["Upper Back", "Lats"],
    secondaryMuscles: ["Biceps", "Forearms"],
  },
  {
    canonicalName: "Seated Cable Rows",
    aliases: ["seated cable row", "cable row", "cable rows", "seated row", "low row"],
    muscleGroup: "back",
    primaryMuscles: ["Upper Back", "Lats"],
    secondaryMuscles: ["Biceps", "Forearms"],
  },
  {
    canonicalName: "Face Pulls",
    aliases: ["face pull", "face pulls", "cable face pull", "rope face pull"],
    muscleGroup: "shoulders",
    primaryMuscles: ["Upper Back", "Shoulders"],
    secondaryMuscles: ["Scapula"],
  },

  // --- SHOULDERS & ARMS ---
  {
    canonicalName: "Overhead Shoulder Press",
    aliases: [
      "overhead press",
      "ohp",
      "shoulder press",
      "military press",
      "barbell shoulder press",
      "dumbbell shoulder press",
      "db shoulder press",
      "dumbbell single-arm shoulder press",
      "single arm shoulder press",
    ],
    muscleGroup: "shoulders",
    primaryMuscles: ["Shoulders"],
    secondaryMuscles: ["Triceps", "Upper Back", "Core"],
  },
  {
    canonicalName: "Lateral Raises",
    aliases: [
      "lateral raise",
      "lateral raises",
      "side raise",
      "side raises",
      "dumbbell lateral raise",
      "cable lateral raise",
    ],
    muscleGroup: "shoulders",
    primaryMuscles: ["Shoulders"],
    secondaryMuscles: ["Upper Back"],
  },
  {
    canonicalName: "Bicep Curls",
    aliases: [
      "bicep curl",
      "bicep curls",
      "dumbbell curl",
      "dumbbell curls",
      "barbell curl",
      "bb curl",
      "cable curl",
      "hammer curl",
      "hammer curls",
    ],
    muscleGroup: "arms",
    primaryMuscles: ["Biceps"],
    secondaryMuscles: ["Forearms"],
  },
  {
    canonicalName: "Triceps Pushdowns",
    aliases: [
      "tricep pushdown",
      "triceps pushdown",
      "rope pushdown",
      "cable tricep extension",
      "overhead tricep extension",
      "overhead cable triceps extension",
      "skull crusher",
      "skullcrushers",
    ],
    muscleGroup: "arms",
    primaryMuscles: ["Triceps"],
    secondaryMuscles: ["Shoulders"],
  },

  // --- CORE ---
  {
    canonicalName: "Plank",
    aliases: ["plank", "planks", "forearm plank", "front plank", "high plank"],
    muscleGroup: "core",
    primaryMuscles: ["Abs", "Core"],
    secondaryMuscles: ["Shoulders", "Glutes"],
  },
  {
    canonicalName: "Hanging Leg Raises",
    aliases: ["hanging leg raise", "hanging leg raises", "leg raise", "leg raises", "captain chair leg raise"],
    muscleGroup: "core",
    primaryMuscles: ["Abs", "Core"],
    secondaryMuscles: ["Forearms"],
  },
  {
    canonicalName: "Ab Wheel Rollouts",
    aliases: ["ab rollout", "ab rollouts", "ab wheel", "ab wheel rollout", "ab wheel rollouts"],
    muscleGroup: "core",
    primaryMuscles: ["Abs", "Core"],
    secondaryMuscles: ["Lats", "Shoulders"],
  },

  // --- CARDIO ---
  {
    canonicalName: "Running Intervals",
    aliases: [
      "running",
      "run",
      "running intervals",
      "treadmill run",
      "treadmill intervals",
      "sprint intervals",
      "sprints",
    ],
    muscleGroup: "full-body",
    primaryMuscles: ["Quads", "Calves"],
    secondaryMuscles: ["Hamstrings", "Glutes", "Core"],
  },
  {
    canonicalName: "Incline Treadmill Walk",
    aliases: [
      "incline treadmill walk",
      "incline treadmill walking",
      "incline treadmill",
      "treadmill incline walk",
      "treadmill incline walking",
      "treadmill incline",
      "walking on incline treadmill",
      "incline walk",
      "incline walking",
    ],
    muscleGroup: "full-body",
    primaryMuscles: ["Calves", "Hamstrings", "Glutes"],
    secondaryMuscles: ["Quads", "Core"],
  },
  {
    canonicalName: "Treadmill Walk",
    aliases: [
      "treadmill walk",
      "treadmill walking",
      "treadmill walks",
      "walk on treadmill",
      "walking on treadmill",
      "treadmill cardio walk",
      "treadmill cardio",
    ],
    muscleGroup: "full-body",
    primaryMuscles: ["Calves", "Quads"],
    secondaryMuscles: ["Hamstrings", "Glutes", "Core"],
  },
  {
    canonicalName: "Walking",
    aliases: [
      "walking",
      "walk",
      "walks",
      "outdoor walk",
      "outdoor walking",
      "brisk walk",
      "brisk walking",
      "power walk",
      "power walking",
    ],
    muscleGroup: "full-body",
    primaryMuscles: ["Calves", "Quads"],
    secondaryMuscles: ["Hamstrings", "Glutes"],
  },
  {
    canonicalName: "Stair Climber",
    aliases: [
      "stair climber",
      "stair climbers",
      "step climber",
      "step climbers",
      "step climber machine",
      "stair climber machine",
      "climber machine",
      "stair master",
      "stairmaster",
      "stepmill",
      "step mill",
      "climbmill",
      "climb mill",
      "step machine",
      "walking on stepmill",
    ],
    muscleGroup: "full-body",
    primaryMuscles: ["Quads", "Glutes", "Calves"],
    secondaryMuscles: ["Hamstrings", "Core"],
  },
];

// Fast lookup maps
const ALIAS_LOOKUP = new Map<string, CanonicalExercise>();

for (const ex of CANONICAL_EXERCISES) {
  const normCanonical = ex.canonicalName.toLowerCase().replace(/[^a-z0-9]/g, "");
  ALIAS_LOOKUP.set(normCanonical, ex);

  for (const alias of ex.aliases) {
    const normAlias = alias.toLowerCase().replace(/[^a-z0-9]/g, "");
    ALIAS_LOOKUP.set(normAlias, ex);
  }
}

/**
 * Check if an exercise name matches a known canonical movement directly.
 */
export function findCanonicalExercise(name: string): CanonicalExercise | undefined {
  if (!name) return undefined;
  const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  return ALIAS_LOOKUP.get(normalized);
}
