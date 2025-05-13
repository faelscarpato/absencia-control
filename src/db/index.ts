import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Create PostgreSQL connection using Supabase connection string
const connectionString = 'postgresql://postgres:postgres@db.uoucrpnoonprqhgxoobb.supabase.co:5432/postgres';
const client = postgres(connectionString);

// Create drizzle database instance
export const db = drizzle(client, { schema });
