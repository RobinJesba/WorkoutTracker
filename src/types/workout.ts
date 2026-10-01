import { MuscleGroup } from "@/components/MuscleIcon";

export interface WorkoutItem {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  targetMuscles: string[]; // e.g. ["Quadriceps", "Glutes"]
  details: string;
}

export interface WorkoutEntry {
  id: string;
  date: string;
  title: string;
  items: WorkoutItem[];
}
