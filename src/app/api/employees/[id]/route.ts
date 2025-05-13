import { NextResponse } from "next/server";
import { db } from "@/db";
import { employees as employeesTable, absences as absencesTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // First delete associated absences (cascading delete)
    await db.delete(absencesTable)
      .where(eq(absencesTable.employeeId, parseInt(id)));

    // Then delete the employee
    const [deletedEmployee] = await db.delete(employeesTable)
      .where(eq(employeesTable.id, parseInt(id)))
      .returning();

    if (!deletedEmployee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return NextResponse.json(
      { error: "Failed to delete employee" },
      { status: 500 }
    );
  }
}
