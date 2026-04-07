import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from "pg";
import dotenv from "dotenv";
import { sql } from 'drizzle-orm';
import * as schema from './schema';

dotenv.config({ path: '.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

console.log("Ansluter till databas:", process.env.DB_NAME);

export const db = drizzle(pool, { schema });

const testconnection = async () => { 
    try {
        const result = await db.execute(sql`SELECT NOW()`);
        console.log("Databas ansluten!", result);
    } catch (error) {
        console.error("Kunde ej ansluta till databasen", error);
    }
};

testconnection();