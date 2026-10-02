import { MuscleGroup } from "@/components/MuscleIcon";

export interface WorkoutItem {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  targetMuscles: string[]; // e.g. ["Quads", "Glutes"]
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  details: string;
  isExisting?: boolean;
}

export interface WorkoutEntry {
  id: string;
  date: string;
  title: string;
  items: WorkoutItem[];
}
