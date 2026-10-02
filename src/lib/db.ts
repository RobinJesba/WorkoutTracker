import { WorkoutEntry, WorkoutItem } from "@/types/workout";
import { INITIAL_WORKOUTS } from "@/data/workouts";
import { findUnifiedExercise } from "@/lib/exerciseDatabase";
import { formatWorkoutDate } from "@/lib/date";

interface CloudflareEnv {
  DB?: {
    prepare: (query: string) => {
      bind: (...args: any[]) => any;
      all: () => Promise<{ results: any[] }>;
      run: () => Promise<any>;
    };
    batch?: (statements: any[]) => Promise<any[]>;
  };
  WORKOUT_API_KEY?: string;
}

async function getDB() {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = (await getCloudflareContext({ async: true })) as { env: CloudflareEnv };
    return { db: env?.DB, env };
  } catch {
    return { db: undefined, env: undefined };
  }
}

// 1. READ ALL WORKOUTS
export async function getWorkouts(): Promise<WorkoutEntry[]> {
  try {
    const { db } = await getDB();

    if (db) {
      const workoutsRes = await db.prepare(
        "SELECT id, date, title, created_at FROM workouts ORDER BY created_at DESC"
      ).all();

      const itemsRes = await db.prepare(
        "SELECT id, workout_id, name, muscle_group, target_muscles, details, sort_order FROM workout_items ORDER BY sort_order ASC"
      ).all();

      const rawWorkouts = (workoutsRes.results || []) as Array<{
        id: string;
        date: string;
        title: string;
      }>;

      const rawItems = (itemsRes.results || []) as Array<{
        id: string;
        workout_id: string;
        name: string;
        muscle_group: any;
        target_muscles: string;
        details: string;
      }>;

      if (rawWorkouts.length > 0) {
        return rawWorkouts.map((w) => ({
          id: w.id,
          date: formatWorkoutDate(w.date),
          title: w.title,
          items: rawItems
            .filter((item) => item.workout_id === w.id)
            .map((item) => {
              let targetMuscles: string[] = [];
              let primaryMuscles: string[] | undefined = undefined;
              let secondaryMuscles: string[] | undefined = undefined;
              try {
                const parsed = JSON.parse(item.target_muscles || "[]");
                if (Array.isArray(parsed)) {
                  targetMuscles = parsed;
                } else if (parsed && typeof parsed === "object") {
                  primaryMuscles = parsed.primary;
                  secondaryMuscles = parsed.secondary;
                  targetMuscles = parsed.primary || [];
                }
              } catch {
                targetMuscles = [item.target_muscles];
              }

              if (!primaryMuscles && item.name) {
                const match = findUnifiedExercise(item.name);
                if (match) {
                  primaryMuscles = match.primaryMuscles;
                  secondaryMuscles = match.secondaryMuscles;
                }
              }

              return {
                id: item.id,
                name: item.name,
                muscleGroup: item.muscle_group,
                targetMuscles,
                primaryMuscles,
                secondaryMuscles,
                details: item.details,
              };
            }),
        }));
      }
    }
  } catch (error) {
    console.error("Error reading from D1:", error);
  }

  return INITIAL_WORKOUTS;
}

// 2. CREATE (OR MERGE) WORKOUT
export async function createWorkout(workout: WorkoutEntry): Promise<{ success: boolean; id: string; merged?: boolean }> {
  const { db } = await getDB();
  if (!db) {
    throw new Error("Cloudflare D1 database is not connected.");
  }

  const standardDate = formatWorkoutDate(workout.date);

  // 1. Check if a workout with this exact date already exists
  const existingRes = await db.prepare(
    "SELECT id, date, title FROM workouts WHERE date = ? OR date = ? LIMIT 1"
  ).bind(standardDate, workout.date).all();

  const existing = (existingRes.results?.[0] as { id: string; date: string; title: string }) || null;

  if (existing) {
    const targetWorkoutId = existing.id;

    // Merge: Append new items to the existing workout
    // Update parent title if updated title is provided
    if (workout.title && workout.title.trim() && workout.title.trim() !== existing.title) {
      await db.prepare(
        "UPDATE workouts SET title = ? WHERE id = ?"
      ).bind(workout.title.trim(), targetWorkoutId).run();
    }

    // Get current max sort_order
    const maxSortRes = await db.prepare(
      "SELECT MAX(sort_order) as max_sort FROM workout_items WHERE workout_id = ?"
    ).bind(targetWorkoutId).all();

    const maxSort = Number((maxSortRes.results?.[0] as any)?.max_sort) || 0;
    const startOrder = maxSort + 1;

    if (workout.items && workout.items.length > 0) {
      for (let i = 0; i < workout.items.length; i++) {
        const item = workout.items[i];
        const itemId = item.id || `item-${Date.now()}-${i}`;
        await db.prepare(
          "INSERT INTO workout_items (id, workout_id, name, muscle_group, target_muscles, details, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)"
        ).bind(
          itemId,
          targetWorkoutId,
          item.name,
          item.muscleGroup,
          JSON.stringify({
            primary: item.primaryMuscles || item.targetMuscles || [],
            secondary: item.secondaryMuscles || [],
          }),
          item.details,
          startOrder + i
        ).run();
      }
    }

    return { success: true, id: targetWorkoutId, merged: true };
  }

  // 2. Otherwise create a new workout
  const id = workout.id || `workout-${Date.now()}`;

  // Insert parent workout
  await db.prepare(
    "INSERT INTO workouts (id, date, title) VALUES (?, ?, ?)"
  ).bind(id, standardDate, workout.title).run();

  // Insert items
  if (workout.items && workout.items.length > 0) {
    for (let i = 0; i < workout.items.length; i++) {
      const item = workout.items[i];
      const itemId = item.id || `item-${Date.now()}-${i}`;
      await db.prepare(
        "INSERT INTO workout_items (id, workout_id, name, muscle_group, target_muscles, details, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).bind(
        itemId,
        id,
        item.name,
        item.muscleGroup,
        JSON.stringify({
          primary: item.primaryMuscles || item.targetMuscles || [],
          secondary: item.secondaryMuscles || [],
        }),
        item.details,
        i + 1
      ).run();
    }
  }

  return { success: true, id, merged: false };
}

// 3. UPDATE WORKOUT
export async function updateWorkout(workout: WorkoutEntry): Promise<{ success: boolean }> {
  const { db } = await getDB();
  if (!db) {
    throw new Error("Cloudflare D1 database is not connected.");
  }

  const standardDate = formatWorkoutDate(workout.date);

  // Update workout info
  await db.prepare(
    "UPDATE workouts SET date = ?, title = ? WHERE id = ?"
  ).bind(standardDate, workout.title, workout.id).run();

  // Replace items
  if (workout.items) {
    await db.prepare("DELETE FROM workout_items WHERE workout_id = ?").bind(workout.id).run();

    for (let i = 0; i < workout.items.length; i++) {
      const item = workout.items[i];
      const itemId = item.id || `item-${Date.now()}-${i}`;
      await db.prepare(
        "INSERT INTO workout_items (id, workout_id, name, muscle_group, target_muscles, details, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).bind(
        itemId,
        workout.id,
        item.name,
        item.muscleGroup,
        JSON.stringify({
          primary: item.primaryMuscles || item.targetMuscles || [],
          secondary: item.secondaryMuscles || [],
        }),
        item.details,
        i + 1
      ).run();
    }
  }

  return { success: true };
}

// 4. DELETE WORKOUT
export async function deleteWorkout(id: string): Promise<{ success: boolean }> {
  const { db } = await getDB();
  if (!db) {
    throw new Error("Cloudflare D1 database is not connected.");
  }

  await db.prepare("DELETE FROM workouts WHERE id = ?").bind(id).run();
  return { success: true };
}
