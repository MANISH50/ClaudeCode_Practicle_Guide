import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

const DATABASE_PATH = process.env.DATABASE_PATH ?? "./data/notes.db";

function openDatabase(): Database {
  mkdirSync(dirname(DATABASE_PATH), { recursive: true });

  const database = new Database(DATABASE_PATH, { create: true });

  // WAL is stored in the database file, so it applies to every table in it
  // (Better Auth tables and `note`). The other pragmas are per connection.
  database.run("PRAGMA journal_mode = WAL");
  database.run("PRAGMA synchronous = NORMAL");
  database.run("PRAGMA busy_timeout = 5000");
  database.run("PRAGMA foreign_keys = ON");

  // Application-owned table. Better Auth tables are created by its CLI
  // (`bun run auth:migrate`); SQLite lets this reference "user" before it exists.
  database.run(`
    CREATE TABLE IF NOT EXISTS note (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE,
      title       TEXT,
      content     TEXT NOT NULL,
      is_public   INTEGER NOT NULL DEFAULT 0,
      share_token TEXT UNIQUE,
      created_at  TEXT NOT NULL,
      updated_at  TEXT NOT NULL
    )
  `);
  database.run(
    "CREATE INDEX IF NOT EXISTS idx_note_user_updated ON note (user_id, updated_at)",
  );

  return database;
}

// Reuse one connection across Next.js dev hot reloads.
const globalForDb = globalThis as unknown as { __db?: Database };

export const db = (globalForDb.__db ??= openDatabase());
