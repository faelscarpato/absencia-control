import { pgTable, serial, text, timestamp, boolean, integer, unique } from "drizzle-orm/pg-core";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { relations } from "drizzle-orm";

// Employees table
export const employees = pgTable('employees', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Absences table
export const absences = pgTable('absences', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id').notNull().references(() => employees.id, { onDelete: 'cascade' }),
  date: text('date').notNull(), // YYYY-MM-DD format
  reason: text('reason').notNull(),
  approved: boolean('approved').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    // Ensure one absence record per employee per day
    uniqueEmployeeDate: unique().on(table.employeeId, table.date),
  };
});

// Break schedules table
export const breakSchedules = pgTable('break_schedules', {
  id: serial('id').primaryKey(),
  date: text('date').notNull().unique(), // YYYY-MM-DD format with unique constraint
  shifts: text('shifts').notNull(), // JSON string of shifts data
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Define relations
export const employeesRelations = relations(employees, ({ many }) => ({
  absences: many(absences),
}));

export const absencesRelations = relations(absences, ({ one }) => ({
  employee: one(employees, {
    fields: [absences.employeeId],
    references: [employees.id],
  }),
}));

// Define types for select, insert, and update operations
export type Employee = InferSelectModel<typeof employees>;
export type NewEmployee = InferInsertModel<typeof employees>;

export type Absence = InferSelectModel<typeof absences>;
export type NewAbsence = InferInsertModel<typeof absences>;

export type BreakSchedule = InferSelectModel<typeof breakSchedules>;
export type NewBreakSchedule = InferInsertModel<typeof breakSchedules>;
