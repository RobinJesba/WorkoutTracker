export interface CardioIntervalBlock {
  id: string;
  name: string;
  totalSets: number;
  workInterval: {
    durationSec: number;
    speedKmh: number;
    inclinePercent?: number;
    label?: string;
  };
  restInterval: {
    durationSec: number;
    speedKmh: number;
    inclinePercent?: number;
    label?: string;
  };
  metrics: {
    totalDurationSec: number;
    totalWorkTimeSec: number;
    totalRestTimeSec: number;
    estimatedDistanceKm: number;
    peakSpeedKmh: number;
    avgSpeedKmh: number;
  };
}

export interface StrengthSet {
  setNumber: number;
  reps: number;
  weightKg?: number;
  isWarmup?: boolean;
  rpe?: number; // Rate of Perceived Exertion (1-10)
  completed: boolean;
}

export interface StrengthExercise {
  id: string;
  name: string;
  targetMuscleGroup: string;
  sets: StrengthSet[];
  totalVolumeKg?: number;
  notes?: string;
}

export interface TrainerFeedback {
  id: string;
  coachName: string;
  coachRole: string;
  date: string;
  comment: string;
  status: "approved" | "needs-adjustment" | "personal-best";
  nextTarget?: string;
}

export interface WorkoutSession {
  id: string;
  date: string; // YYYY-MM-DD
  dayLabel: string; // e.g. "Today", "Yesterday", "Mon, Sep 28"
  time: string; // e.g. "07:30 AM"
  title: string;
  category: "cardio" | "strength" | "hybrid";
  totalDurationMin: number;
  rawUserQuote: string;
  notes?: string;
  cardioBlocks?: CardioIntervalBlock[];
  strengthExercises?: StrengthExercise[];
  trainerFeedback?: TrainerFeedback;
}

export interface AthleteProfile {
  name: string;
  handle: string;
  currentCycle: string;
  weeklyTargetSessions: number;
  trainerName: string;
  trainerRole: string;
  lastSyncDate: string;
}
