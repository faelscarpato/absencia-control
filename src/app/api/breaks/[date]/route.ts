import { NextResponse } from "next/server";
import { db } from "@/db";
import { breakSchedules as breakSchedulesTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: { date: string } }
) {
  try {
    const { date } = params;

    const [schedule] = await db.select()
      .from(breakSchedulesTable)
      .where(eq(breakSchedulesTable.date, date))
      .limit(1);

    if (!schedule) {
      return NextResponse.json(null);
    }

    // Parse the shifts JSON
    return NextResponse.json({
      ...schedule,
      shifts: JSON.parse(schedule.shifts)
    });
  } catch (error) {
    console.error("Error fetching break schedule:", error);
    return NextResponse.json(
      { error: "Failed to fetch break schedule" },
      { status: 500 }
    );
  }
}
