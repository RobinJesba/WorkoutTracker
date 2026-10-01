import { WorkoutSession, AthleteProfile } from "@/types/workout";

export const ATHLETE_PROFILE: AthleteProfile = {
  name: "Robin",
  handle: "@robin",
  currentCycle: "Aerobic Conditioning & Lower Body Power",
  weeklyTargetSessions: 4,
  trainerName: "Coach Marcus Vance",
  trainerRole: "Head of Strength & Conditioning",
  lastSyncDate: "Oct 1, 2026",
};

export const INITIAL_WORKOUTS: WorkoutSession[] = [
  {
    id: "workout-2026-10-01",
    date: "2026-10-01",
    dayLabel: "Today",
    time: "07:15 AM",
    title: "Treadmill Intervals & Lower Body Power",
    category: "hybrid",
    totalDurationMin: 42,
    rawUserQuote:
      "I ran for 2 minutes at 12 km speed and walked for 2 minutes at 3 km, and I did 5 sets. And I did squats, 15 reps, 3 sets.",
    notes:
      "High intensity intervals felt sharp. Maintained upright posture on the 12 km/h pushes. Squats had consistent depth across all 3 sets.",
    cardioBlocks: [
      {
        id: "cardio-interval-1",
        name: "5x High-Low Treadmill Intervals",
        totalSets: 5,
        workInterval: {
          durationSec: 120, // 2 mins
          speedKmh: 12.0,
          label: "Threshold Run",
        },
        restInterval: {
          durationSec: 120, // 2 mins
          speedKmh: 3.0,
          label: "Active Recovery Walk",
        },
        metrics: {
          totalDurationSec: 1200, // 20 mins
          totalWorkTimeSec: 600, // 10 mins
          totalRestTimeSec: 600, // 10 mins
          estimatedDistanceKm: 2.5, // (10/60 * 12) + (10/60 * 3) = 2.0 + 0.5 = 2.5 km
          peakSpeedKmh: 12.0,
          avgSpeedKmh: 7.5,
        },
      },
    ],
    strengthExercises: [
      {
        id: "exercise-squats",
        name: "Barbell / Bodyweight Squats",
        targetMuscleGroup: "Quadriceps, Glutes, Core",
        notes: "Full range of motion, controlled eccentric tempo (2-0-1).",
        totalVolumeKg: 2250, // e.g. 50kg x 45 reps if weighted, or tracking 45 total reps
        sets: [
          { setNumber: 1, reps: 15, weightKg: 50, completed: true, rpe: 7 },
          { setNumber: 2, reps: 15, weightKg: 50, completed: true, rpe: 7.5 },
          { setNumber: 3, reps: 15, weightKg: 50, completed: true, rpe: 8.5 },
        ],
      },
    ],
    trainerFeedback: {
      id: "feedback-10-01",
      coachName: "Coach Marcus Vance",
      coachRole: "Head S&C Coach",
      date: "Today at 08:30 AM",
      status: "approved",
      comment:
        "Outstanding discipline on those 12 km/h pushes. 1:1 work-to-rest ratio (2m on / 2m off) is dialed in for lactic clearance. For the squats, let's bump the second and third sets to 52.5kg next cycle if knee tracking feels solid.",
      nextTarget: "Target for next treadmill session: 6 sets or bump run to 12.5 km/h for the final 2 intervals.",
    },
  },
  {
    id: "workout-2026-09-29",
    date: "2026-09-29",
    dayLabel: "Tuesday",
    time: "06:45 PM",
    title: "Upper Body Hypertrophy & Pull Volume",
    category: "strength",
    totalDurationMin: 48,
    rawUserQuote:
      "Pull-ups 4 sets of 8 reps bodyweight, Incline Dumbbell Bench Press 3 sets of 10 at 22kg per hand, Face pulls 3 sets of 15.",
    notes: "Solid lat engagement on pull-ups. Chest press felt stable.",
    strengthExercises: [
      {
        id: "exercise-pullups",
        name: "Neutral Grip Pull-ups",
        targetMuscleGroup: "Lats, Biceps, Upper Back",
        sets: [
          { setNumber: 1, reps: 8, completed: true, rpe: 7 },
          { setNumber: 2, reps: 8, completed: true, rpe: 7.5 },
          { setNumber: 3, reps: 8, completed: true, rpe: 8 },
          { setNumber: 4, reps: 8, completed: true, rpe: 9 },
        ],
      },
      {
        id: "exercise-db-bench",
        name: "Incline DB Bench Press",
        targetMuscleGroup: "Upper Pectorals, Anterior Deltoid",
        totalVolumeKg: 1320,
        sets: [
          { setNumber: 1, reps: 10, weightKg: 44, completed: true, rpe: 7.5 },
          { setNumber: 2, reps: 10, weightKg: 44, completed: true, rpe: 8 },
          { setNumber: 3, reps: 10, weightKg: 44, completed: true, rpe: 8.5 },
        ],
      },
    ],
    trainerFeedback: {
      id: "feedback-09-29",
      coachName: "Coach Marcus Vance",
      coachRole: "Head S&C Coach",
      date: "Sep 29, 2026",
      status: "approved",
      comment:
        "Clean pull volume without shoulder compensation. Keep that chin-over-bar pause consistent.",
    },
  },
  {
    id: "workout-2026-09-27",
    date: "2026-09-27",
    dayLabel: "Sunday",
    time: "08:00 AM",
    title: "Zone 2 Base Aerobic Steady Run",
    category: "cardio",
    totalDurationMin: 35,
    rawUserQuote: "Ran outdoor 5 km steady pace around 6:30 min/km, heart rate under 142 bpm.",
    notes: "Nasal breathing maintained for first 25 minutes. Smooth cadence.",
    cardioBlocks: [
      {
        id: "cardio-steady-1",
        name: "Outdoor Aerobic Base Run",
        totalSets: 1,
        workInterval: {
          durationSec: 2100, // 35 min
          speedKmh: 9.2,
          label: "Zone 2 Aerobic Base",
        },
        restInterval: {
          durationSec: 0,
          speedKmh: 0,
        },
        metrics: {
          totalDurationSec: 2100,
          totalWorkTimeSec: 2100,
          totalRestTimeSec: 0,
          estimatedDistanceKm: 5.38,
          peakSpeedKmh: 10.1,
          avgSpeedKmh: 9.2,
        },
      },
    ],
  },
];

export function getWeeklyStats(workouts: WorkoutSession[]) {
  let totalMinutes = 0;
  let hiitWorkMinutes = 0;
  let totalDistanceKm = 0;
  let totalStrengthSets = 0;
  let totalVolumeKg = 0;

  workouts.forEach((w) => {
    totalMinutes += w.totalDurationMin;
    w.cardioBlocks?.forEach((cb) => {
      totalDistanceKm += cb.metrics.estimatedDistanceKm;
      // Work time in HIIT if speed >= 10 km/h or sets > 1
      if (cb.totalSets > 1) {
        hiitWorkMinutes += Math.round(cb.metrics.totalWorkTimeSec / 60);
      }
    });
    w.strengthExercises?.forEach((se) => {
      totalStrengthSets += se.sets.length;
      if (se.totalVolumeKg) {
        totalVolumeKg += se.totalVolumeKg;
      }
    });
  });

  return {
    sessionsThisWeek: workouts.length,
    targetSessions: 4,
    adherencePercent: Math.min(100, Math.round((workouts.length / 4) * 100)),
    totalMinutes,
    hiitWorkMinutes,
    totalDistanceKm: Number(totalDistanceKm.toFixed(1)),
    totalStrengthSets,
    totalVolumeKg,
  };
}
