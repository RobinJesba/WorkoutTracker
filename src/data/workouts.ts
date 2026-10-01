import { WorkoutEntry } from "@/types/workout";

export const ATHLETE_NAME = "Robin";

export const INITIAL_WORKOUTS: WorkoutEntry[] = [
  {
    id: "workout-1",
    date: "Thursday, Oct 1, 2026",
    title: "Interval Run & Bodyweight Squats",
    items: [
      {
        id: "item-1-1",
        name: "Running Intervals",
        muscleGroup: "legs",
        targetMuscles: ["Quads", "Calves"],
        details: "5 sets: 2 mins run @ 12 km/h + 2 mins walk @ 3 km/h (0% incline)",
      },
      {
        id: "item-1-2",
        name: "Bodyweight Squats",
        muscleGroup: "quads",
        targetMuscles: ["Quads", "Glutes"],
        details: "3 sets × 15 reps",
      },
    ],
  },
];
