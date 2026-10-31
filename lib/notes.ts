import { cache } from "react";
import { db } from "@/lib/db";
import type { TiptapDoc } from "@/lib/note-schema";

type NewNote = { title: string | null; content: TiptapDoc };

export type NoteSummary = {
  id: string;
  title: string | null;
  isPublic: boolean;
  updatedAt: string;
};

const LIST_LIMIT = 50;

// Returns the new note's id. The owner always comes from the validated session.
export function createNote(userId: string, { title, content }: NewNote): string {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  db.query(
    `INSERT INTO note (id, user_id, title, content, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(id, userId, title, JSON.stringify(content), now, now);

  return id;
}

// Scoped by owner, so another user's id changes nothing. Returns whether a row was updated.
export function updateNote(userId: string, id: string, { title, content }: NewNote): boolean {
  const now = new Date().toISOString();

  return (
    db
      .query("UPDATE note SET title = ?, content = ?, updated_at = ? WHERE id = ? AND user_id = ?")
      .run(title, JSON.stringify(content), now, id, userId).changes > 0
  );
}

export type NoteDetail = NoteSummary & { content: TiptapDoc; shareToken: string | null };

// Owner-scoped: another user's id, or a missing one, returns null.
export const getNote = cache((userId: string, id: string): NoteDetail | null => {
  const row = db
    .query<
      {
        id: string;
        title: string | null;
        content: string;
        is_public: number;
        share_token: string | null;
        updated_at: string;
      },
      [string, string]
    >("SELECT id, title, content, is_public, share_token, updated_at FROM note WHERE id = ? AND user_id = ?")
    .get(id, userId);

  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    content: JSON.parse(row.content) as TiptapDoc,
    isPublic: row.is_public === 1,
    shareToken: row.share_token,
    updatedAt: row.updated_at,
  };
});

// Scoped by owner, so another user's id deletes nothing. Returns whether a row was removed.
export function deleteNote(userId: string, id: string): boolean {
  return db.query("DELETE FROM note WHERE id = ? AND user_id = ?").run(id, userId).changes > 0;
}

// 32 random bytes, base64url: 43 characters, unguessable (SPEC 3.4).
const SHARE_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

// Turns sharing on and returns the token. An already-shared note keeps its token.
// Owner-scoped: returns null when the note is not the user's.
export function enableSharing(userId: string, id: string): string | null {
  const candidate = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("base64url");

  db.query("UPDATE note SET is_public = 1, share_token = COALESCE(share_token, ?) WHERE id = ? AND user_id = ?").run(
    candidate,
    id,
    userId,
  );

  return (
    db
      .query<{ share_token: string | null }, [string, string]>(
        "SELECT share_token FROM note WHERE id = ? AND user_id = ?",
      )
      .get(id, userId)?.share_token ?? null
  );
}

// Clears the token, so the old link stops working and a new one is issued next time (SPEC 3.4).
export function disableSharing(userId: string, id: string): boolean {
  return (
    db.query("UPDATE note SET is_public = 0, share_token = NULL WHERE id = ? AND user_id = ?").run(id, userId).changes >
    0
  );
}

export type SharedNote = { title: string | null; content: TiptapDoc; updatedAt: string };

// Public lookup. Only a note that is currently shared is returned; the token is never a row id.
export function getSharedNote(token: string): SharedNote | null {
  if (!SHARE_TOKEN_PATTERN.test(token)) return null;

  const row = db
    .query<{ title: string | null; content: string; updated_at: string }, [string]>(
      "SELECT title, content, updated_at FROM note WHERE share_token = ? AND is_public = 1",
    )
    .get(token);

  if (!row) return null;

  return { title: row.title, content: JSON.parse(row.content) as TiptapDoc, updatedAt: row.updated_at };
}

// Uncapped total, so counts stay correct beyond the LIST_LIMIT shown in lists.
export const countNotes = cache((userId: string): number => {
  const row = db.query<{ count: number }, [string]>("SELECT COUNT(*) AS count FROM note WHERE user_id = ?").get(userId);

  return row?.count ?? 0;
});

// Newest first, without `content` (SPEC 11). Cached so the sidebar and the
// dashboard share one query per request. Uses idx_note_user_updated.
export const listNotes = cache((userId: string): NoteSummary[] => {
  const rows = db
    .query<{ id: string; title: string | null; is_public: number; updated_at: string }, [string, number]>(
      `SELECT id, title, is_public, updated_at FROM note
       WHERE user_id = ? ORDER BY updated_at DESC LIMIT ?`,
    )
    .all(userId, LIST_LIMIT);

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    isPublic: row.is_public === 1,
    updatedAt: row.updated_at,
  }));
});
