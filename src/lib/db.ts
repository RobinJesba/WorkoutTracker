import { WorkoutEntry } from "@/types/workout";
import { INITIAL_WORKOUTS } from "@/data/workouts";

interface CloudflareEnv {
  DB?: {
    prepare: (query: string) => {
      bind: (...args: any[]) => any;
      all: () => Promise<{ results: any[] }>;
      run: () => Promise<any>;
    };
  };
}

export async function getWorkouts(): Promise<WorkoutEntry[]> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = (await getCloudflareContext({ async: true })) as { env: CloudflareEnv };

    if (env?.DB) {
      const workoutsRes = await env.DB.prepare(
        "SELECT id, date, title, created_at FROM workouts ORDER BY created_at DESC"
      ).all();

      const itemsRes = await env.DB.prepare(
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
          date: w.date,
          title: w.title,
          items: rawItems
            .filter((item) => item.workout_id === w.id)
            .map((item) => {
              let targetMuscles: string[] = [];
              try {
                targetMuscles = JSON.parse(item.target_muscles || "[]");
              } catch {
                targetMuscles = [item.target_muscles];
              }
              return {
                id: item.id,
                name: item.name,
                muscleGroup: item.muscle_group,
                targetMuscles,
                details: item.details,
              };
            }),
        }));
      }
    }
  } catch (error) {
    // If running in local dev without D1 binding or during static build
    // fallback gracefully to INITIAL_WORKOUTS
  }

  return INITIAL_WORKOUTS;
}
