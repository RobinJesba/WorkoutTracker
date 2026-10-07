import { NextRequest, NextResponse } from "next/server";
import { getTrainerNotes, saveTrainerNotes, clearTrainerNotes } from "@/lib/db";
import { getAccessStatus } from "@/app/api/workouts/route";

export const dynamic = "force-dynamic";

// Helper to check if caller can edit/clear trainer notes (Admin or Trainer)
async function canManageNotes(req: NextRequest): Promise<boolean> {
  if (process.env.NODE_ENV === "development") {
    // In local dev, allow managing notes (check if not explicitly mocked as viewer)
    const mockRole = req.headers.get("x-mock-role");
    if (mockRole === "viewer") return false;
    return true;
  }

  const { isAdmin, isTrainer } = await getAccessStatus(req);
  return isAdmin || isTrainer;
}

// 1. GET: Fetch trainer notes from DB
export async function GET(_req: NextRequest) {
  try {
    const notes = await getTrainerNotes();
    return NextResponse.json(
      { notes: notes || "" },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch trainer notes", details: error?.message },
      { status: 500 }
    );
  }
}

// 2. POST: Save/update trainer notes in DB
export async function POST(req: NextRequest) {
  try {
    if (!(await canManageNotes(req))) {
      return NextResponse.json(
        { error: "Unauthorized. Only admins and trainers can update notes." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const content = typeof body.notes === "string" ? body.notes : (body.content || "");

    await saveTrainerNotes(content);

    return NextResponse.json(
      { success: true, notes: content },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to save trainer notes", details: error?.message },
      { status: 500 }
    );
  }
}

// 3. DELETE: Clear trainer notes from DB
export async function DELETE(req: NextRequest) {
  try {
    if (!(await canManageNotes(req))) {
      return NextResponse.json(
        { error: "Unauthorized. Only admins and trainers can clear notes." },
        { status: 403 }
      );
    }

    await clearTrainerNotes();

    return NextResponse.json(
      { success: true, cleared: true },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to clear trainer notes", details: error?.message },
      { status: 500 }
    );
  }
}
