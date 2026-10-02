import { NextRequest, NextResponse } from "next/server";
import { 
  getWorkouts, 
  createWorkout, 
  updateWorkout, 
  deleteWorkout 
} from "@/lib/db";
import { WorkoutEntry } from "@/types/workout";

export const dynamic = "force-dynamic";

// Strict API Key or Cloudflare Access authorization
async function isAuthorized(req: NextRequest): Promise<boolean> {
  // 1. Local development convenience
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  // 2. Cloudflare Zero Trust Access: Authenticated via Google OAuth
  const cfUserEmail = req.headers.get("cf-access-authenticated-user-email");
  if (cfUserEmail) {
    return true;
  }

  // 3. Strict API Key authorization for programmatic access
  let secretKey = process.env.WORKOUT_API_KEY;

  if (!secretKey) {
    try {
      const { getCloudflareContext } = await import("@opennextjs/cloudflare");
      const { env } = (await getCloudflareContext({ async: true })) as any;
      secretKey = env?.WORKOUT_API_KEY;
    } catch {
      // ignore
    }
  }

  if (!secretKey) return false;

  const providedKey =
    req.headers.get("x-api-key") ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  return Boolean(providedKey && providedKey === secretKey);
}

// 1. GET: Read all workouts (with Edge Caching headers)
export async function GET() {
  try {
    const workouts = await getWorkouts();

    return NextResponse.json(
      { workouts },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch workouts", details: error?.message },
      { status: 500 }
    );
  }
}

// 2. POST: Create a new workout
export async function POST(req: NextRequest) {
  try {
    if (!(await isAuthorized(req))) {
      return NextResponse.json({ error: "Unauthorized. Valid x-api-key required." }, { status: 401 });
    }

    const body = (await req.json()) as WorkoutEntry;
    if (!body.title || !body.date) {
      return NextResponse.json({ error: "title and date are required." }, { status: 400 });
    }

    const result = await createWorkout(body);
    return NextResponse.json({ success: true, id: result.id, merged: result.merged }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to create workout", details: error?.message },
      { status: 500 }
    );
  }
}

// 3. PUT: Update an existing workout
export async function PUT(req: NextRequest) {
  try {
    if (!(await isAuthorized(req))) {
      return NextResponse.json({ error: "Unauthorized. Valid x-api-key required." }, { status: 401 });
    }

    const body = (await req.json()) as WorkoutEntry;
    if (!body.id) {
      return NextResponse.json({ error: "Workout id is required for update." }, { status: 400 });
    }

    await updateWorkout(body);
    return NextResponse.json({ success: true, id: body.id }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update workout", details: error?.message },
      { status: 500 }
    );
  }
}

// 4. DELETE: Delete a workout
export async function DELETE(req: NextRequest) {
  try {
    if (!(await isAuthorized(req))) {
      return NextResponse.json({ error: "Unauthorized. Valid x-api-key required." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body?.id;
    }

    if (!id) {
      return NextResponse.json({ error: "Workout id is required for deletion." }, { status: 400 });
    }

    await deleteWorkout(id);
    return NextResponse.json({ success: true, deletedId: id }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to delete workout", details: error?.message },
      { status: 500 }
    );
  }
}
