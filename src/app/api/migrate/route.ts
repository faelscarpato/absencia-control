import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET() {
  try {
    // This endpoint will be used to migrate data from localStorage to Supabase
    // It should be called once after setting up Supabase
    
    // Check if tables exist and create them if they don't
    try {
      const { error: employeesError } = await supabaseAdmin
        .from('employees')
        .select('id')
        .limit(1);
      
      if (employeesError && employeesError.code === '42P01') {
        // Table doesn't exist, create it
        await supabaseAdmin.rpc('exec', { 
          query: `CREATE TABLE IF NOT EXISTS employees (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            role TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );`
        });
      }
    } catch (err) {
      console.error('Error checking employees table:', err);
    }
    
    try {
      const { error: absencesError } = await supabaseAdmin
        .from('absences')
        .select('id')
        .limit(1);
      
      if (absencesError && absencesError.code === '42P01') {
        // Table doesn't exist, create it
        await supabaseAdmin.rpc('exec', { 
          query: `CREATE TABLE IF NOT EXISTS absences (
            id SERIAL PRIMARY KEY,
            employee_id INTEGER NOT NULL REFERENCES employees(id),
            date TEXT NOT NULL,
            reason TEXT NOT NULL,
            approved BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );`
        });
      }
    } catch (err) {
      console.error('Error checking absences table:', err);
    }
    
    try {
      const { error: breakSchedulesError } = await supabaseAdmin
        .from('break_schedules')
        .select('id')
        .limit(1);
      
      if (breakSchedulesError && breakSchedulesError.code === '42P01') {
        // Table doesn't exist, create it
        await supabaseAdmin.rpc('exec', { 
          query: `CREATE TABLE IF NOT EXISTS break_schedules (
            id SERIAL PRIMARY KEY,
            date TEXT NOT NULL UNIQUE,
            shifts TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );`
        });
      }
    } catch (err) {
      console.error('Error checking break_schedules table:', err);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Migration completed successfully. Tables created if they did not exist.' 
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ success: false, error: 'Migration failed' }, { status: 500 });
  }
}
