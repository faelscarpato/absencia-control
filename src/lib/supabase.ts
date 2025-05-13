'use client';

import { createClient } from '@supabase/supabase-js';

// Use the provided Supabase credentials
const supabaseUrl = 'https://uoucrpnoonprqhgxoobb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvdWNycG5vb25wcnFoZ3hvb2JiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMDYyMjcsImV4cCI6MjA2MjY4MjIyN30.xNalmqkkxmUmNniQ-MOaWet0nRBK3YQEDOFYoY444yo';

// Create a Supabase client for use in client components with real-time enabled
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);

// Function to check connection status
export const checkRealtimeConnection = async (): Promise<boolean> => {
  try {
    // Ping the Supabase API to check connectivity
    const { error } = await supabase.from('employees').select('count').limit(1);
    return !error;
  } catch (e) {
    return false;
  }
};
