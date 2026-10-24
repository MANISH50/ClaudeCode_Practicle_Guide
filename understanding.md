# Project Understanding

Last updated: 2026-10-24

## Overview

A Next.js 16 (App Router) project with React 19, Tailwind CSS 4 and TypeScript. It is still the unmodified `create-next-app` starter. The environment and permission settings point toward planned authentication (Better Auth) and a rich-text editor (Tiptap), but neither is installed and no code uses them yet.

## Repository state

- Git repository initialised on branch `main`, with no commits yet.
- All tracked files are staged (`git status` shows `A` for each).
- `.env.example` exists but is git-ignored (`.env*` rule), so it is not staged.

## File map

| Path | Role |
| --- | --- |
| `app/layout.tsx` | Root layout. Loads Geist and Geist Mono via `next/font/google`, sets `lang="en"`, imports `globals.css`, wraps all pages. Title is still "Create Next App". |
| `app/page.tsx` | Home route `/`. Template content with Next and Vercel logos from `public/` and links to Vercel and Next docs. |
| `app/globals.css` | Imports Tailwind, defines `--background` and `--foreground` (with dark-mode override), maps them and the Geist fonts into Tailwind via `@theme inline`. The `body` rule sets Arial, which overrides Geist. |
| `app/favicon.ico` | Site icon. |
| `public/next.svg`, `public/vercel.svg` | Used by `page.tsx`. |
| `public/file.svg`, `public/globe.svg`, `public/window.svg` | Unused template leftovers. |
| `package.json` | Scripts: `dev`, `build`, `start`, `lint`. Dependencies: next, react, react-dom. Dev: Tailwind 4 and its PostCSS plugin, TypeScript, ESLint 9, `eslint-config-next`. Non-standard `ignoreScripts` and `trustedDependencies` keys (sharp, unrs-resolver). Name is `claude-code`. |
| `bun.lock` | Bun lockfile. Project appears to be run with Bun. |
| `next.config.ts` | Empty Next config. |
| `tsconfig.json` | Strict mode, `@/*` path alias to project root (unused so far), Next TypeScript plugin. |
| `eslint.config.mjs` | Next core-web-vitals and TypeScript rules. Ignores `.next`, `out`, `build`. |
| `postcss.config.mjs` | Registers `@tailwindcss/postcss`. |
| `next-env.d.ts` | Generated Next type declarations. Git-ignored. |
| `.env.example` | `BETTER_AUTH_SECRET` placeholder (must be replaced) and `DB_PATH=data/app.db` (SQLite). Not yet read by any code. |
| `.gitignore` | Standard Next ignores plus `.env*`, `*.pem`, `*.tsbuildinfo`, `next-env.d.ts`. |
| `README.md` | Stock create-next-app readme. |
| `.claude/settings.json` | Shared Claude Code permissions: allows bun lint/build/add/run, context7 docs, WebSearch, WebFetch for better-auth.com, bun.com and tiptap.dev, and Playwright browser tools. Sandbox enabled. |
| `.claude/settings.local.json` | Identical to `settings.json`. |

## How the pieces connect

- Request flow: `layout.tsx` wraps `page.tsx` for `/`.
- Styling flow: `postcss.config.mjs` runs Tailwind, `globals.css` defines the theme variables, and `page.tsx` consumes the classes they generate.
- Font flow: `layout.tsx` injects Geist CSS variables, `globals.css` maps them into `--font-sans` and `--font-mono`, but the `body` rule overrides the font family to Arial.
- Tooling flow: `package.json` scripts call Next, ESLint and TypeScript, configured by `eslint.config.mjs` and `tsconfig.json`.
- Planned flow: `.env.example` and the WebFetch allowances suggest Better Auth (secret-based sessions) backed by a SQLite file at `DB_PATH`, plus Tiptap for editing. None of this is wired up.

## Observations and open items

- `.claude/settings.local.json` is staged. Local settings are usually meant to stay uncommitted; consider adding it to `.gitignore`.
- `.env.example` has a placeholder secret. Copy it to `.env` and generate a real `BETTER_AUTH_SECRET` (32+ characters) before use.
- `layout.tsx` metadata still says "Create Next App".
- `body` font override in `globals.css` means Geist is loaded but not used for body text.
- `public/file.svg`, `globe.svg` and `window.svg` are unused.
- No commits exist yet, so there is no history to review.
