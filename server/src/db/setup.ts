import { readFile } from "fs/promises";
import path from "path";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Client } = pg;

async function setupDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    const schemaPath = path.join(process.cwd(), "src", "db", "schema.sql");
    const schema = await readFile(schemaPath, "utf-8");

    await client.query(schema);

    console.log("Database schema created successfully.");
  } catch (error) {
    console.error("Database setup failed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupDatabase();