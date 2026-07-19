import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import config from "@/drizzle.config";
import { env } from "~/config/env";

const runMigrate = async () => {
  console.log("⏳ Starting the database migration process...");

  const migrationPool = new Pool({
    host: env.DB_HOST,
    database: env.DB_NAME,
    port: Number(env.DB_PORT),
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    max: 1,
  });

  const db = drizzle(migrationPool);

  try {
    await migrate(db, { migrationsFolder: config.out! });

    console.log("✅ Database migration successfully!");
  } catch (error) {
    console.error("❌ Database migration failed:", error);
    process.exit(1);
  } finally {
    await migrationPool.end();
  }
};

runMigrate();
