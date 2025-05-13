import { createClient } from '@supabase/supabase-js';

// Create a Supabase client for use in server components and API routes
const supabaseUrl = 'https://uoucrpnoonprqhgxoobb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvdWNycG5vb25wcnFoZ3hvb2JiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzEwNjIyNywiZXhwIjoyMDYyNjgyMjI3fQ.M6uW0mYaXrTtxZspZSmBFzkHJuCYx8OH9OtpOAXDq6k';

// eslint-disable-next-line import/no-anonymous-default-export
export const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
