import { NextResponse } from "next/server";
import { EXERCISE_CATALOG_TEXT } from "@/data/exerciseCatalogNames";
import { findUnifiedExercise } from "@/lib/exerciseDatabase";
import { WorkoutItem } from "@/types/workout";

interface CloudflareEnv {
  AI?: {
    run: (model: string, inputs: any) => Promise<any>;
  };
}

async function getAI() {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = (await getCloudflareContext({ async: true })) as { env: CloudflareEnv };
    return env?.AI;
  } catch {
    return undefined;
  }
}

const SYSTEM_PROMPT = `You are a precise workout logger assistant for Robin.
Convert the user's raw gym workout notes into a clean JSON structure.

### APPROVED STANDARDIZED MUSCLE TARGETS:
Upper Body: Chest, Lats, Upper Back, Scapula, Lower Back, Shoulders, Biceps, Triceps, Forearms
Lower Body: Quads, Hamstrings, Glutes, Calves
Core: Abs, Core

### OFFICIAL EXERCISE CATALOG:
${EXERCISE_CATALOG_TEXT}

### GUIDELINES:
1. Match each exercise to the closest EXACT name from the official catalog whenever possible, setting "isCustom": false.
2. If an exercise is a novel, unlisted, or custom variation (e.g., stability ball, landmine, unusual unilateral exercise), set "isCustom": true, provide a clean descriptive name, and choose 1 (or 2) primaryMuscles and 1 or 2 secondaryMuscles strictly from the APPROVED LIST.
3. Format the "details" string cleanly based on Robin's past logs (see examples).
4. Infer a short, descriptive workout title (e.g. "Upper Body Pull & Push", "Leg Day & Intervals", "Full Body Circuit").

### FEW-SHOT EXAMPLES:

Example 1 (Variable Weights & Reps - Catalog match):
Input: "Dumbbell chest press - 10kg * 6, 7.5kg * 12, 7.5 * 10"
Parsed:
{
  "name": "Dumbbell Chest Press",
  "details": "3 sets: 10kg × 6, 7.5kg × 12, 7.5kg × 10 reps",
  "isCustom": false
}

Example 2 (Bodyweight with Varying Reps - Catalog match):
Input: "Scapula pullups 15reps, 10reps"
Parsed:
{
  "name": "Scapula Pull-ups",
  "details": "2 sets: 15 reps, 10 reps",
  "isCustom": false
}

Example 3 (Uniform Sets × Reps - Catalog match):
Input: "Scapula pushups 15reps * 2"
Parsed:
{
  "name": "Scapula Push-ups",
  "details": "2 sets × 15 reps",
  "isCustom": false
}

Example 4 (Custom Unilateral / Stability Ball - 1-2 Primary & Secondary):
Input: "Kettlebell Stability Ball Single-Arm Chest Press -> 4kg * 6 reps"
Parsed:
{
  "name": "Kettlebell Stability Ball Single-Arm Chest Press",
  "details": "4kg × 6 reps",
  "isCustom": true,
  "primaryMuscles": ["Chest", "Core"],
  "secondaryMuscles": ["Triceps", "Shoulders"]
}

Example 5 (Custom Isolation - Single Primary + 1 Secondary):
Input: "Overhead Rope Cable Triceps Extension 15kg 3x12"
Parsed:
{
  "name": "Overhead Cable Triceps Extension",
  "details": "3 sets × 12 reps @ 15kg",
  "isCustom": true,
  "primaryMuscles": ["Triceps"],
  "secondaryMuscles": ["Shoulders"]
}

Example 6 (Custom Pull - Single Primary + 2 Secondaries):
Input: "Single Arm Kneeling Cable Lat Pulldown 12kg * 12, 12kg * 10"
Parsed:
{
  "name": "Single Arm Kneeling Cable Lat Pulldown",
  "details": "2 sets: 12kg × 12, 12kg × 10 reps",
  "isCustom": true,
  "primaryMuscles": ["Lats"],
  "secondaryMuscles": ["Biceps", "Upper Back"]
}

Example 7 (Cardio Intervals):
Input: "Running: 5 sets 2 mins run @ 12km/h and 2 mins walk 3km/h flat"
Parsed:
{
  "name": "Running Intervals",
  "details": "5 sets: 2 mins run @ 12 km/h + 2 mins walk @ 3 km/h (0% incline)",
  "isCustom": false
}

OUTPUT FORMAT:
Return ONLY valid JSON (no markdown formatting, no backticks, no comments) with this structure:
{
  "title": "Upper Body Pull & Push",
  "items": [
    {
      "name": "Exercise Name",
      "details": "Formatted details",
      "isCustom": false,
      "primaryMuscles": ["..."],
      "secondaryMuscles": ["..."]
    }
  ]
}
`;

// Local deterministic fallback parser if AI is unavailable (e.g. offline local dev)
function fallbackLocalParse(text: string) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 2 && !l.startsWith("#"));

  const items = lines.map((line, idx) => {
    // Split on dash, arrow, or colon
    const parts = line.split(/[-–—:>]/);
    const rawName = (parts[0] || line).trim();
    const rawDetails = (parts.slice(1).join(" ") || line).trim();

    const match = findUnifiedExercise(rawName);
    const name = match ? match.name : rawName;
    const primaryMuscles = match ? match.primaryMuscles : ["Full-body"];
    const secondaryMuscles = match ? match.secondaryMuscles : [];

    return {
      id: `item-${Date.now()}-${idx}`,
      name,
      muscleGroup: (match?.category?.toLowerCase() || primaryMuscles[0]?.toLowerCase() || "full-body") as any,
      targetMuscles: primaryMuscles,
      primaryMuscles,
      secondaryMuscles,
      details: rawDetails || line,
    };
  });

  return {
    title: "Logged Workout",
    items,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text = body?.text?.trim();

    if (!text) {
      return NextResponse.json({ error: "Missing workout text" }, { status: 400 });
    }

    const ai = await getAI();

    let rawJsonText = "";

    if (ai) {
      // Call Cloudflare Workers AI with Llama 3.3 70B
      const response = await ai.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: text },
        ],
        max_tokens: 1500,
        temperature: 0.1,
      });

      rawJsonText = response?.response || "";
    }

    let parsedResult: {
      title?: string;
      items?: Array<{
        name: string;
        details: string;
        isCustom?: boolean;
        primaryMuscles?: string[];
        secondaryMuscles?: string[];
      }>;
    } | null = null;

    if (rawJsonText) {
      try {
        const jsonMatch = rawJsonText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResult = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.warn("Failed to parse Llama 3.3 output as JSON, using fallback", e);
      }
    }

    // Fallback if AI not available or returned non-JSON
    if (!parsedResult || !parsedResult.items || parsedResult.items.length === 0) {
      const fallback = fallbackLocalParse(text);
      return NextResponse.json({
        title: fallback.title,
        items: fallback.items,
        source: "local-parser",
      });
    }

    // Enrich parsed items with our local database
    const finalItems: WorkoutItem[] = parsedResult.items.map((item, idx) => {
      let primary = item.primaryMuscles || [];
      let secondary = item.secondaryMuscles || [];
      let muscleGroup = "full-body";

      if (!item.isCustom) {
        const match = findUnifiedExercise(item.name);
        if (match) {
          primary = match.primaryMuscles;
          secondary = match.secondaryMuscles;
          muscleGroup = match.category?.toLowerCase() || primary[0]?.toLowerCase() || "full-body";
        }
      } else {
        muscleGroup = primary[0]?.toLowerCase() || "full-body";
      }

      return {
        id: `item-parsed-${Date.now()}-${idx}`,
        name: item.name,
        muscleGroup: muscleGroup as any,
        targetMuscles: primary,
        primaryMuscles: primary,
        secondaryMuscles: secondary,
        details: item.details,
      };
    });

    return NextResponse.json({
      title: parsedResult.title || "Logged Workout",
      items: finalItems,
      source: "llama-3.3-70b",
    });
  } catch (error: any) {
    console.error("Workout parsing error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to parse workout" },
      { status: 500 }
    );
  }
}
