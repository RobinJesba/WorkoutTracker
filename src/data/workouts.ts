import { WorkoutEntry } from "@/types/workout";

export const ATHLETE_NAME = "Robin";
export const TRAINER_NAME = "Marcus";

export const INITIAL_WORKOUTS: WorkoutEntry[] = [
  {
    id: "workout-1",
    date: "Thursday, Oct 1, 2026",
    title: "Interval Run & Squats",
    items: [
      {
        id: "item-1-1",
        name: "Running Intervals",
        type: "cardio",
        details: "5 sets: 2 mins run @ 12 km/h + 2 mins walk @ 3 km/h",
      },
      {
        id: "item-1-2",
        name: "Squats",
        type: "strength",
        details: "3 sets × 15 reps",
      },
    ],
    notes: "Felt strong throughout all 5 interval pushes.",
    coachNote: "Solid pace on the 12 km/h runs. Next session let's keep the same interval structure.",
  },
  {
    id: "workout-2",
    date: "Tuesday, Sep 29, 2026",
    title: "Upper Body Pull & Push",
    items: [
      {
        id: "item-2-1",
        name: "Pull-ups",
        type: "strength",
        details: "4 sets × 8 reps (Bodyweight)",
      },
      {
        id: "item-2-2",
        name: "Incline DB Bench Press",
        type: "strength",
        details: "3 sets × 10 reps @ 22kg",
      },
      {
        id: "item-2-3",
        name: "Face Pulls",
        type: "strength",
        details: "3 sets × 15 reps",
      },
    ],
  },
  {
    id: "workout-3",
    date: "Sunday, Sep 27, 2026",
    title: "Steady Base Run",
    items: [
      {
        id: "item-3-1",
        name: "Outdoor Run",
        type: "cardio",
        details: "5 km steady pace (35 mins)",
      },
    ],
    notes: "Easy aerobic pace, kept heart rate controlled.",
  },
];
