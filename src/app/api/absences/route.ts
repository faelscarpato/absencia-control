import { NextResponse } from "next/server";
import { db } from "@/db";
import { absences as absencesTable, employees as employeesTable, NewAbsence } from "@/db/schema";
import { desc, eq, and } from "drizzle-orm";

export async function GET() {
  try {
    const absencesList = await db.select().from(absencesTable).orderBy(desc(absencesTable.date));
    return NextResponse.json(absencesList);
  } catch (error) {
    console.error("Error fetching absences:", error);
    return NextResponse.json(
      { error: "Failed to fetch absences" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employeeId, date, reason, approved = true } = body;

    if (!employeeId || !date || !reason) {
      return NextResponse.json(
        { error: "Employee ID, date, and reason are required" },
        { status: 400 }
      );
    }

    // Check if employee exists
    const employee = await db.select()
      .from(employeesTable)
      .where(eq(employeesTable.id, employeeId))
      .limit(1);

    if (employee.length === 0) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    // Check if absence already exists for this employee and date
    const existingAbsence = await db.select()
      .from(absencesTable)
      .where(
        and(
          eq(absencesTable.employeeId, employeeId),
          eq(absencesTable.date, date)
        )
      )
      .limit(1);

    if (existingAbsence.length > 0) {
      return NextResponse.json(
        { error: "An absence record already exists for this employee on this date" },
        { status: 409 }
      );
    }

    const absenceData: NewAbsence = {
      employeeId,
      date,
      reason,
      approved
    };

    const [newAbsence] = await db.insert(absencesTable)
      .values(absenceData)
      .returning();

    return NextResponse.json(newAbsence);
  } catch (error) {
    console.error("Error creating absence:", error);
    return NextResponse.json(
      { error: "Failed to create absence" },
      { status: 500 }
    );
  }
}
