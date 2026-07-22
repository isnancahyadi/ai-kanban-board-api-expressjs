import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "~/config/env";
import * as schema from "~/db/schema";

const pool = new Pool({
  host: env.DB_HOST,
  database: env.DB_NAME,
  port: Number(env.DB_PORT),
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL pool error:", err);
});

const db = drizzle({ client: pool, schema, logger: true });

export default db;
