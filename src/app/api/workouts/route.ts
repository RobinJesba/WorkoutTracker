import { NextResponse } from "next/server";
import { getWorkouts } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const workouts = await getWorkouts();
    return NextResponse.json({ workouts });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch workouts" },
      { status: 500 }
    );
  }
}
