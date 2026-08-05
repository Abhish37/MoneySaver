import { neon } from '@neondatabase/serverless';

async function dropTable() {
  const sql = neon("postgresql://neondb_owner:npg_04EZpXvSOjsD@ep-winter-shadow-avx61nqk-pooler.c-11.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");
  try {
    await sql`DROP TABLE IF EXISTS "push_subscriptions" CASCADE`;
    console.log("Table dropped successfully.");
  } catch (err) {
    console.error("Error dropping table:", err);
  }
}

dropTable();
