# CLAUDE.md

We are building the application defined in `@SPEC.md`.

- **Source of truth:** Always read `@SPEC.md` before making architectural decisions, modifying database structures, or implementing features that affect the existing design.
- **Keep it updated:** For every new feature or change, update `@SPEC.md` to reflect the agreed requirements and implementation.
- **Follow existing conventions:** Reuse the defined architecture, tech stack, database schema, and coding patterns. Avoid unnecessary dependencies or redesigns.
- **Concise responses:** Focus on relevant decisions and actionable changes. Avoid unnecessary explanations, repetition, and lengthy code snippets.
- **Token efficiency:** Prefer minimal context, targeted file reads, and focused changes. Do not repeat information already documented in `@SPEC.md`.
- **Clarify conflicts:** If a request conflicts with `@SPEC.md` or leaves a critical ambiguity, ask before proceeding.

Prioritize correctness, consistency, and minimal token usage.

## Repository layout

The project is the root Next.js app (`app/`, `package.json`, `tsconfig.json`, ...): Next.js 16 App Router, React 19, Tailwind CSS 4, TypeScript, Bun (`bun.lock`). It is still the `create-next-app` template: `app/page.tsx` is stock content and `app/layout.tsx` metadata still says "Create Next App".

- **`SPEC.md`**: the spec for the note-taking app being built here (Better Auth, TipTap editor, notes table, public sharing). It is not implemented yet.
- **`application2/`**: a separate StayVista Flask demo. It is out of scope for this project; ignore it.
- **`understanding.md`**: earlier analysis that is partly stale (it says there are no commits and everything is staged; the repo now has commits and is clean). Don't rely on it without checking.

## Commands

### Root (Next.js)

Not verified in this environment: Bun was not installed when this file was written, so these come from `package.json` and `README.md`.

- `bun install`
- `bun run dev`: dev server on http://localhost:3000
- `bun run build` / `bun run start`
- `bun run lint`: ESLint 9 flat config (`eslint.config.mjs`, `eslint-config-next`)

There is no test script and no test framework configured.

## Next.js side

- Styling: `postcss.config.mjs` loads `@tailwindcss/postcss`. `app/globals.css` defines theme variables with `@theme inline`. Its `body` rule forces Arial, so the Geist fonts loaded in `layout.tsx` are not used for body text.
- `tsconfig.json` defines the `@/*` path alias (currently unused).
- `.env.example` lists `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` and `DATABASE_PATH`. Copy it to `.env.local`. Auth and the database layer (`lib/auth.ts`, `lib/db.ts`) are built. The editor, note CRUD, and sharing are not.
- Bun is installed. Scripts use `bun --bun` (needed for `bun:sqlite`). Run `bun run auth:migrate` to create the Better Auth tables.
