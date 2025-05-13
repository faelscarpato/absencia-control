import { NextResponse } from "next/server";
import { db } from "@/db";
import { breakSchedules as breakSchedulesTable, NewBreakSchedule } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const schedules = await db.select().from(breakSchedulesTable).orderBy(desc(breakSchedulesTable.date));
    
    // Parse JSON shifts data
    const parsedSchedules = schedules.map(schedule => ({
      ...schedule,
      shifts: JSON.parse(schedule.shifts)
    }));
    
    return NextResponse.json(parsedSchedules);
  } catch (error) {
    console.error("Error fetching break schedules:", error);
    return NextResponse.json(
      { error: "Failed to fetch break schedules" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, shifts } = body;

    if (!date || !shifts) {
      return NextResponse.json(
        { error: "Date and shifts are required" },
        { status: 400 }
      );
    }

    // Check if a schedule for this date already exists
    const existingSchedule = await db.select()
      .from(breakSchedulesTable)
      .where(eq(breakSchedulesTable.date, date))
      .limit(1);

    // Convert shifts object to JSON string
    const shiftsJson = typeof shifts === 'string' ? shifts : JSON.stringify(shifts);
    
    if (existingSchedule.length > 0) {
      // Update existing schedule
      const [updatedSchedule] = await db.update(breakSchedulesTable)
        .set({
          shifts: shiftsJson,
          updatedAt: new Date()
        })
        .where(eq(breakSchedulesTable.id, existingSchedule[0].id))
        .returning();
      
      return NextResponse.json({
        ...updatedSchedule,
        shifts: JSON.parse(updatedSchedule.shifts)
      });
    } else {
      // Create new schedule
      const scheduleData: NewBreakSchedule = {
        date,
        shifts: shiftsJson
      };

      const [newSchedule] = await db.insert(breakSchedulesTable)
        .values(scheduleData)
        .returning();
      
      return NextResponse.json({
        ...newSchedule,
        shifts: JSON.parse(newSchedule.shifts)
      });
    }
  } catch (error) {
    console.error("Error saving break schedule:", error);
    return NextResponse.json(
      { error: "Failed to save break schedule" },
      { status: 500 }
    );
  }
}
