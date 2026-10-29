# Running the application

## Prerequisites
- [Bun](https://bun.sh) (install on Windows: `winget install --id Oven-sh.Bun`). Restart the terminal afterwards so `bun` is on PATH.
- Check: `bun --version`

## Steps
1. Open a terminal in the project root (the folder containing `package.json`, not `application2/`).
2. Install dependencies: `bun install`
3. Create `.env.local` from `.env.example` (it is gitignored). Set `BETTER_AUTH_SECRET` to a random string of 32+ characters, for example `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
4. Create the auth tables (once, and again after changing auth plugins): `bun run auth:migrate`. The database file is `data/notes.db` and runs in WAL mode. The `note` table is created automatically when `lib/db.ts` first loads.
5. Start the dev server: `bun run dev`
6. Open http://localhost:3000, then register at `/sign-up`.

Other commands:
- `bun run lint`: ESLint
- `bun run build`: production build
- `bun run start`: serve the production build (run `bun run build` first)

## Routes to check
`/dashboard`, `/notes`, `/notes/new` and `/notes/[id]` require a signed-in user and redirect to `/sign-in` otherwise. Every page has the NextNotes header: Log out when signed in, Sign in / Get started when signed out. Signed-in pages show the notes sidebar (a drawer behind the "Your notes" button on narrow screens).

| URL | Expected |
| --- | --- |
| `/` | Landing page with a CTA (Get started, or Go to your notes when signed in) |
| `/sign-in`, `/sign-up` | Combined form (`/sign-up` redirects to `/sign-in?mode=sign-up`); success redirects to `/dashboard` or the `callbackUrl` |
| `/dashboard` | Greeting, New Note button, card grid of your notes or an empty state. The bin icon on a card (or a sidebar item) asks for confirmation, then deletes the note |
| `/notes` | Signed in: placeholder. Signed out: redirect to `/sign-in` |
| `/notes/new` | Title + rich-text editor; Save note stores it and redirects to `/notes/<id>`, and it appears in the sidebar |
| `/notes/123` | Placeholder, same protection as `/notes` |
| `/share/abc` | Public placeholder for token abc |
| any other URL | 404 |

## Known lint output
`bun run lint` also scans `application2/` (the unrelated StayVista demo) and reports 2 warnings, in `application2/static/js/booking.js` and `main.js`. There are 0 errors, and nothing from `app/`. To lint only this project: `bun x eslint app lib proxy.ts`.

## Troubleshooting
- `bun: command not found`: restart the terminal, or sign out and back in.
- Always start the app with `bun run dev` (not `npx next dev`): the scripts use `bun --bun` so `bun:sqlite` is available.
- `no such table: user`: run `bun run auth:migrate`.
- Port 3000 busy: stop the other process, or run `bun run dev -- -p 3001`.
- Strange build errors: delete `.next/` and `node_modules/`, then run `bun install` again.
