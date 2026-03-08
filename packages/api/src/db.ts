import pg from "pg";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export async function initDb(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email         TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at    TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS blocked_sites (
      id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id             UUID REFERENCES users(id) ON DELETE CASCADE,
      domain              TEXT NOT NULL,
      start_timestamp     BIGINT NOT NULL,
      emergency_use_count INT DEFAULT 0,
      UNIQUE(user_id, domain)
    );

    CREATE TABLE IF NOT EXISTS emergency_access (
      user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
      domain     TEXT NOT NULL,
      expires_at BIGINT NOT NULL,
      PRIMARY KEY (user_id, domain)
    );

    CREATE TABLE IF NOT EXISTS penalties (
      user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
      domain     TEXT NOT NULL,
      expires_at BIGINT NOT NULL,
      PRIMARY KEY (user_id, domain)
    );
  `);
}
