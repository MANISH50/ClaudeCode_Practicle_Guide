# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

We are building the application defined in `@SPEC.md`.

- **Source of truth:** Always read `@SPEC.md` before making architectural decisions, modifying database structures, or implementing features that affect the existing design.
- **Keep it updated:** For every new feature or change, update `@SPEC.md` to reflect the agreed requirements and implementation.
- **Follow existing conventions:** Reuse the defined architecture, tech stack, database schema, and coding patterns. Avoid unnecessary dependencies or redesigns.
- **Concise responses:** Focus on relevant decisions and actionable changes. Avoid unnecessary explanations, repetition, and lengthy code snippets.
- **Clarify conflicts:** If a request conflicts with `@SPEC.md` or leaves a critical ambiguity, ask before proceeding.

Prioritize correctness, consistency, and minimal token usage.

Whenever you work with a third-party library, look up its official documentation so you are working from up-to-date information. Use the DocsExplorer agent for efficient documentation lookup.

## Token optimisation

Include only information that changes the work. Before loading or writing context, ask whether the answer would be wrong without it.

Input:

- Locate before reading: use Grep or Glob to find the line, then Read with `offset` and `limit`. Read a whole file only when you need all of it.
- Read each file once per task, and reuse what is already in the conversation.
- Read only the relevant `@SPEC.md` section, not the whole file. Do not repeat what the spec already says.
- Skip by default: `node_modules/`, `.next/`, `bun.lock`, `tsconfig.tsbuildinfo`, `application2/`, `.claude/worktrees/`, `understanding.md`, `CLAUDE_bkp1.md`.
- Limit command output: use quiet flags for installs and builds, and filter typecheck and lint output to errors.

Output:

- Answer first. Do not restate the question or recap what you just did.
- Do not reprint files or diffs you have written. Reference them as `file_path:line_number`.
- Show code only when the user needs to read it. Describe an edit in one line.
- Keep final summaries to what changed, what was verified, and what remains open.

Delegation:

- Ask subagents for conclusions, not file dumps, and keep their reports short.

Never cut verification (typecheck, lint, build), review of the change, or explanations of decisions the user must make. Those are part of the quality bar, not optional overhead.

## Repository layout

A note-taking app (spec in `SPEC.md`) at the repo root: Next.js 16 App Router, React 19, Tailwind CSS 4, TypeScript, Bun, Better Auth, `bun:sqlite`, TipTap 3, Zod 4.

Built: email/password auth, route protection, the SQLite layer, the landing page, the site-wide header, the dashboard with the notes sidebar, the `/notes` list, note creation (`/notes/new`), view/edit (`/notes/[id]`), and delete. Still a placeholder: `/share/[token]` (public sharing).

- **`RUNNING.md`**: setup steps, a route checklist, and troubleshooting. Keep it in sync when routes or setup change.
- **`application2/`**: an unrelated StayVista Flask demo. Ignore it.
- **`understanding.md`**: stale early analysis. Don't rely on it.
- **`README.md`**: stock `create-next-app` text with nothing project-specific.

## Commands

- `bun install`
- `bun run dev`: dev server on http://localhost:3000. Always use the scripts, which run `bun --bun`. Plain `next dev` under Node can't load `bun:sqlite`.
- `bun run build` / `bun run start`
- `bun run auth:migrate`: creates or updates the Better Auth tables. Run it once, and again after changing auth plugins.
- `bun x tsc --noEmit`: typecheck
- `bun x eslint app lib proxy.ts`: lints this project only. `bun run lint` also scans `application2/` and reports 2 known warnings there.

There is no test script and no test framework configured. Browser user-flow checks go through the `test-end-to-end-functionality` agent (it does not run typecheck, lint or build; run those yourself); after fixing its open items, re-invoke it with `rerun failed`.

Formatting: a PostToolUse hook (`.claude/hooks/format.ts`, wired in `.claude/settings.json`) runs Prettier (`.prettierrc.json`, printWidth 120) on every file Claude edits, logging to `.claude/hooks/format.log`. Don't reformat by hand.

Setup: copy `.env.example` to `.env.local`. It holds `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` and `DATABASE_PATH` (default `./data/notes.db`).

## Architecture

- **Database (`lib/db.ts`)**: one shared `bun:sqlite` connection, cached on `globalThis` so it survives dev hot reloads, with WAL and `foreign_keys` turned on. Better Auth owns its tables, which `auth:migrate` creates. The app owns `note`, which `CREATE TABLE IF NOT EXISTS` creates when the module loads. `note` has no migration tool, so make schema changes in that statement and in `SPEC.md` section 5.
- **Data access (`lib/notes.ts`)**: plain SQL through `db.query(...)` with no ORM. Note content is stored as TipTap JSON text. The owner id always comes from the session, never from client input.
- **Auth**: `lib/auth.ts` holds the server config, and `nextCookies()` must stay the last plugin. `lib/auth-client.ts` is for client components. `app/api/auth/[...all]` mounts the handler.
- **Route protection has two layers.** `proxy.ts` (Next 16's replacement for `middleware.ts`) only checks that the session cookie exists, for `/dashboard` and `/notes`. The real check is `requireSession(callbackUrl)` from `lib/session.ts`, and every protected page and every Server Action must call it. `getSession` is wrapped in React `cache()`, so repeat calls within one request don't hit the database again.
- **Redirects**: pass any user-supplied `callbackUrl` through `safeRedirectPath` (`lib/safe-redirect.ts`), which falls back to `/dashboard`.
- **Mutations**: Server Actions sit next to their page (for example `app/notes/new/actions.ts`) and are used with `useActionState`. On failure they return `{ values, errors }`. On success they call `redirect()`, which must stay outside any try/catch.
- **Validation (`lib/note-schema.ts`)**: the Zod schemas allow exactly the TipTap node and mark types the editor offers (SPEC 3.3), and cap size and nesting depth. Both the editor (`app/notes/new/rich-text-editor.tsx`, reused by `/notes/[id]`) and the schema import `editorExtensions` from `lib/editor-extensions.ts`, so change allowed formatting there and keep SPEC 3.3 in step.
- **UI shell**: the root layout renders the site-wide `AppHeader` (`app/app-header.tsx`, session-aware). Signed-in pages wrap their content in `NotesShell(userId)` (`app/notes/notes-shell.tsx`), which adds the notes sidebar and a Popover API drawer on mobile, fed by the cached `listNotes`. Theme tokens and keyframes are in `app/globals.css`, shared control classes in `app/ui.ts`. Animations must stay covered by the global reduced-motion rule.
- **Conventions**: use the `@/*` path alias. Use Tailwind utilities with `dark:` variants and visible `focus-visible` rings. Headings use `heading` (Fraunces via `font-display`) from `app/ui.ts`. For other sizes, use the size variants (`buttonPrimaryLarge`, `fieldBase`) rather than adding padding or text-size classes on top of a shared class, because conflicting utilities resolve unpredictably. The project skills in `.claude/skills/` (Next.js, React, Tailwind, Bun, accessibility, security) describe the expected style.

Rules:

- Never mark work as done while the verdict is NOT READY.
- If an item looks like a false positive or needs a product decision, explain it to me instead of silently ignoring it.
- If the agent reports flaky tests, treat that as a bug to fix, not noise.
- Skip the agent only for changes that cannot affect behaviour (docs, comments, formatting). Say that you are skipping and why.
- Do not edit or weaken tests to make them pass. Fix the code.
