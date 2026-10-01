import { NextRequest, NextResponse } from "next/server";
import { 
  getWorkouts, 
  createWorkout, 
  updateWorkout, 
  deleteWorkout 
} from "@/lib/db";
import { WorkoutEntry } from "@/types/workout";

export const dynamic = "force-dynamic";

// Simple API Key security for mutating data (Create, Update, Delete)
function isAuthorized(req: NextRequest): boolean {
  const secretKey = process.env.WORKOUT_API_KEY || "robin-tracker-secret";
  const providedKey = req.headers.get("x-api-key") || req.headers.get("authorization")?.replace("Bearer ", "");
  
  // If no env is set yet, we allow our default secret
  return providedKey === secretKey;
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
          // Cloudflare Edge Cache: cache for 60s, stale-while-revalidate for 24 hours
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
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: "Unauthorized. Provide valid x-api-key." }, { status: 401 });
    }

    const body = (await req.json()) as WorkoutEntry;
    if (!body.title || !body.date) {
      return NextResponse.json({ error: "title and date are required." }, { status: 400 });
    }

    const result = await createWorkout(body);
    return NextResponse.json({ success: true, id: result.id }, { status: 201 });
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
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: "Unauthorized. Provide valid x-api-key." }, { status: 401 });
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
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: "Unauthorized. Provide valid x-api-key." }, { status: 401 });
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
