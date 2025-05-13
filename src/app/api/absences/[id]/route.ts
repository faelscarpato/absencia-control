import { NextResponse } from "next/server";
import { db } from "@/db";
import { absences as absencesTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    const [deletedAbsence] = await db.delete(absencesTable)
      .where(eq(absencesTable.id, parseInt(id)))
      .returning();

    if (!deletedAbsence) {
      return NextResponse.json(
        { error: "Absence record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting absence:", error);
    return NextResponse.json(
      { error: "Failed to delete absence" },
      { status: 500 }
    );
  }
}
