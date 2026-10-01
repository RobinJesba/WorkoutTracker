export interface WorkoutItem {
  id: string;
  name: string;
  type: "cardio" | "strength" | "other";
  details: string;
}

export interface WorkoutEntry {
  id: string;
  date: string;
  title: string;
  items: WorkoutItem[];
  notes?: string;
  coachNote?: string;
}
