# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

We are building the application defined in `SPEC.md`.

- **Source of truth:** Always read `SPEC.md` before making architectural decisions, modifying database structures, or implementing features that affect the existing design.
- **Keep it updated:** For every new feature or change, update `SPEC.md` to reflect the agreed requirements and implementation.
- **Follow existing conventions:** Reuse the defined architecture, tech stack, database schema, and coding patterns. Avoid unnecessary dependencies or redesigns.
- **Concise responses:** Focus on relevant decisions and actionable changes. Avoid unnecessary explanations, repetition, and lengthy code snippets.
- **Token efficiency:** Prefer minimal context, targeted file reads, and focused changes. Do not repeat information already documented in `SPEC.md`.
- **Clarify conflicts:** If a request conflicts with `SPEC.md` or leaves a critical ambiguity, ask before proceeding.

Prioritize correctness, consistency, and minimal token usage.

## Token optimisation

Quality comes first: never skip a read, check, or verification the task needs just to save tokens. Cut everything else.

**Input (what you read)**

- Read only what the task touches: use Grep/Glob to locate code, then read the needed line range, not whole files. Read a `SPEC.md` section by its heading, not the whole file.
- Never read `bun.lock`, `node_modules/`, `.next/`, `data/`, `application2/`, or `understanding.md`.
- Don't re-read a file you just wrote or edited, or facts already in this file or earlier in the conversation.
- Batch independent reads and commands in one turn. Pipe noisy commands through `head`/`tail`/`grep` so only the relevant output comes back.
- Look up library docs (context7) only for APIs you are unsure of, and ask for the specific topic.
- Use subagents only when the user asks for them: each one starts cold and re-reads context.

**Output (what you write)**

- Answer with genuine information only: decisions, changes, results, open issues. No preamble, restating the request, filler, praise, or closing summaries of what the diff already shows.
- Use Edit for changes; rewrite a whole file only when most of it changes. Don't paste code into chat that is already in a file; cite `path:line`.
- Write no speculative code, comments, abstractions, or docs beyond the request. Updates to `SPEC.md`/`RUNNING.md` state the new fact once, in the section it belongs to.
- When uncertain, ask one precise question instead of producing alternatives.

## Repository layout

The project is the root Next.js app: Next.js 16 App Router, React 19, Tailwind CSS 4, TypeScript, Bun (`bun.lock`).

- **`SPEC.md`**: spec for the note-taking app (Better Auth, TipTap editor, `note` table, public sharing). Section 6 "Current status" tracks what is built.
- **`RUNNING.md`**: setup steps, expected behaviour per route, troubleshooting. Keep it in sync when routes or setup change.
- **`application2/`**: a separate StayVista Flask demo. Out of scope; ignore it.
- **`understanding.md`**: stale early analysis. Don't rely on it.

## Commands

- `bun install`
- `bun run dev`: dev server on http://localhost:3000
- `bun run build` / `bun run start`
- `bun run lint`: ESLint 9 flat config. It also scans `application2/` (2 known warnings there); use `bun x eslint app lib` to lint only this project.
- `bun run auth:migrate`: create/update the Better Auth tables. Rerun after changing auth config or plugins.

Always run through these scripts (they use `bun --bun`): `bun:sqlite` does not work under Node, so `npx next dev` fails.

There is no test script or test framework yet (SPEC section 12 lists the required coverage).

## Environment

`.env.local` (gitignored, as is every `.env*` file; there is no committed `.env.example`) needs `BETTER_AUTH_SECRET` (32+ chars), `BETTER_AUTH_URL` (e.g. `http://localhost:3000`) and optionally `DATABASE_PATH` (default `./data/notes.db`).

## Architecture

- **Database (`lib/db.ts`)**: one `bun:sqlite` `Database` shared by Better Auth and app code, cached on `globalThis` to survive dev hot reloads. Opens in WAL mode with `foreign_keys=ON`. Better Auth owns `user`/`session`/`account`/`verification` (created by its CLI); the app owns `note`, created with `CREATE TABLE IF NOT EXISTS` when the module loads. Use raw parameterized SQL, no ORM.
- **Auth**: `lib/auth.ts` (server, email/password; `nextCookies()` must stay the last plugin), `lib/auth-client.ts` (React client), mounted at `app/api/auth/[...all]/route.ts`. Server code reads the session with `auth.api.getSession({ headers: await headers() })`.
- **Route protection**: `app/notes/layout.tsx` redirects signed-out users to `/sign-in`. Layouts don't re-run on every request, so each note page, server action, or route handler must check the session itself and filter queries by owner `user_id` from the session.
- **Status**: sign-in/sign-up work. `/`, `/notes`, `/notes/new`, `/notes/[id]`, `/share/[token]` are placeholders. TipTap, Zod, note CRUD and sharing are not built or installed yet.

## Gotchas

- `app/layout.tsx` metadata still says "Create Next App", and the `body` rule in `app/globals.css` forces Arial, so the Geist fonts loaded in the layout aren't applied to body text.
- Imports use the `@/*` path alias (`@/lib/auth`).
