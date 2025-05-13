import { NextResponse } from "next/server";
import { db } from "@/db";
import { employees as employeesTable, Employee, NewEmployee } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const employeesList = await db.select().from(employeesTable).orderBy(desc(employeesTable.createdAt));
    
    // Check if we need to create default employees
    if (employeesList.length === 0) {
      // Create default employees if none exist
      const defaultEmployees: NewEmployee[] = [
        { name: 'Gabriel', role: 'Supervisor' },
        { name: 'Thais', role: 'Supervisor' },
        { name: 'Evaldo', role: 'Supervisor' },
        { name: 'Maria', role: 'Supervisor' },
        { name: 'Kelly', role: 'Supervisor' },
        { name: 'Vitória', role: 'Supervisor' },
        { name: 'Emanuel', role: 'Supervisor' },
      ];

      // Add 39 operators
      for (let i = 1; i <= 39; i++) {
        defaultEmployees.push({
          name: `Operador ${i}`,
          role: 'Operador'
        });
      }
      
      // Insert default employees
      await db.insert(employeesTable).values(defaultEmployees);
      
      // Fetch the newly created employees
      const newEmployeesList = await db.select().from(employeesTable).orderBy(desc(employeesTable.createdAt));
      return NextResponse.json(newEmployeesList);
    }
    
    return NextResponse.json(employeesList);
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { error: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, role } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Employee name is required" },
        { status: 400 }
      );
    }

    const employeeData: NewEmployee = {
      name,
      role: role || 'Operador',
    };

    const [newEmployee] = await db.insert(employeesTable)
      .values(employeeData)
      .returning();

    return NextResponse.json(newEmployee);
  } catch (error) {
    console.error("Error creating employee:", error);
    return NextResponse.json(
      { error: "Failed to create employee" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, name, role } = body;

    if (!id || !name) {
      return NextResponse.json(
        { error: "Employee ID and name are required" },
        { status: 400 }
      );
    }

    const [updatedEmployee] = await db.update(employeesTable)
      .set({
        name,
        role,
        updatedAt: new Date()
      })
      .where(eq(employeesTable.id, id))
      .returning();

    if (!updatedEmployee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedEmployee);
  } catch (error) {
    console.error("Error updating employee:", error);
    return NextResponse.json(
      { error: "Failed to update employee" },
      { status: 500 }
    );
  }
}
