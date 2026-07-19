# Personal Tracker

A Next.js PWA for tracking daily tasks, goals, water intake, and sleep — with mobile-OTP login, onboarding that records your "getting started" date, and a separate admin sign-in restricted to a hardcoded phone allowlist.

## Stack

- Next.js (App Router) + React, plain JavaScript
- **Account/onboarding data only** in Supabase (Postgres) via `@supabase/supabase-js`, accessed server-side with the service role key — see `lib/schema.sql`. Just one table: `personal_tracker_users`.
- **Tasks, goals, water, and sleep entries live entirely on-device**, in the browser's IndexedDB (`lib/local/`, via the `idb` package) — the app server and Supabase never see this data at all.
- Twilio Verify for OTP SMS
- Stateless JWT session cookies (`jose`) — separate cookie/secret for regular users vs admins
- Optional, user-initiated backup of the on-device data to the user's own Google Drive (`lib/googleDrive.js`), gzip-compressed client-side before upload.
- `next-pwa` for installability + offline shell

## Data model: what lives where, and why

- **Supabase (`personal_tracker_users` table only)**: phone number, profile fields collected at onboarding, and `onboarding_completed_at` (the "getting started" date). This is what makes login work and what the admin user list shows — nothing else.
- **IndexedDB, one database per user id (`pt-<userId>`)**: every task, goal, water log, and sleep log. This data never leaves the device automatically. Since it's IndexedDB, it doesn't sync between your phone and your laptop by itself — that's what the Google Drive backup is for: export from one device, restore on the other.
- **Google Drive (optional)**: a single gzip-compressed JSON file in a hidden `appDataFolder` only this app can see, containing just the on-device data. The app never stores a Drive refresh token anywhere, so every backup/restore re-prompts a quick Google popup — a deliberate tradeoff to avoid holding any Drive credential server-side.

## Local setup

1. `npm install`
2. Create a free project at [supabase.com](https://supabase.com) if you don't have one, then copy `.env.local.example` to `.env.local` and fill in every value:
   - `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — from your Supabase project's **Settings → API**. The service role key is server-only — never prefix it with `NEXT_PUBLIC_` or send it to the browser.
   - `TWILIO_*` — reuse the Twilio Verify service/account from daily-tracker, or create a new Verify Service in the Twilio console.
   - `SESSION_SECRET` / `ADMIN_SESSION_SECRET` — two different long random strings. Generate with:
     ```
     node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
     ```
   - `ADMIN_PHONES` — comma-separated E.164 numbers (e.g. `+919876543210,+919812345678`) allowed to sign in at `/admin/login`. Nobody else can reach an admin session, and the page is never linked from the regular app.
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — only needed for the optional Drive backup feature; see below. Leave blank and everything else still works, the backup section just won't be able to connect.
3. Create the `personal_tracker_users` table: open your Supabase project's **SQL Editor** and run `lib/schema.sql`.
4. `npm run dev` → http://localhost:3000

## Setting up Google Drive backup (optional)

1. In [Google Cloud Console](https://console.cloud.google.com), create (or reuse) a project, enable the **Google Drive API**.
2. Configure the OAuth consent screen (external, or internal if using Workspace), and add the `drive.appdata` scope.
3. Create an OAuth **Client ID** of type "Web application". Add Authorized JavaScript origins for `http://localhost:3000` and your production domain (no redirect URI needed — this uses the implicit token flow, not a redirect).
4. Put that client ID in `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.
5. In the app, go to Settings → Google Drive backup → pick a frequency and hit "Back up now" the first time to grant access.

## How auth works

- `/login`: mobile number → OTP → on success, either logs an existing user straight into `/dashboard`, or (new number) sends them to `/onboarding` to create their profile. Onboarding is what stamps `onboarding_completed_at` — the "getting started" date shown on `/settings`.
- `/admin/login`: same OTP mechanics, but the phone must be in `ADMIN_PHONES` or it's rejected before an SMS is even sent. Admin sessions are a completely separate cookie/secret from regular user sessions and expire after 12 hours (vs 30 days for regular users). The admin dashboard only ever shows account/onboarding info from Supabase — it has no way to see anyone's tasks, goals, water, or sleep data, since that never reaches the server.
- Route protection is centralized in `proxy.js` (Next.js 16's replacement for `middleware.js`) — it checks the right cookie for `/dashboard`, `/tasks`, `/goals`, `/water`, `/sleep`, `/settings`, `/onboarding`, and everything under `/admin`.

## Milestone sharing

The "Share" button next to a completed goal in `/goals` builds a short message from just that goal's title and completion date (already in hand client-side — there's no server round-trip, since the data already lives only in the user's own browser) and hands it off to the device's native share sheet, or the clipboard as a fallback.

## Deploying to Vercel (recommended)

Vercel is Next.js's native platform, so this needs none of the Hostinger workarounds (no `server.js`, no forcing `--webpack`, no nameserver/subdomain gymnastics) — it just builds and runs the project directly.

1. Push this repo to GitHub if you haven't already (it's already at `github.com/samrudhirwalunj/personal_tracker`).
2. Go to [vercel.com/new](https://vercel.com/new), sign in with GitHub, and import the `personal_tracker` repo. Vercel auto-detects it as Next.js — no build settings to change.
3. Before the first deploy (or right after, then redeploy), add the same environment variables as `.env.local.example` under **Project Settings → Environment Variables**:
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — the **same Supabase project** used locally/on Hostinger; all deployments share one backend, so accounts are consistent everywhere.
   - `TWILIO_*` — same as elsewhere; leave blank if you don't have Twilio yet.
   - `SESSION_SECRET`, `ADMIN_SESSION_SECRET` — generate fresh ones for this deployment (don't reuse the local-dev or Hostinger secrets).
   - `ADMIN_PHONES` — your real number(s).
   - `ALLOW_DUMMY_OTP=true` — only if you want the on-screen dummy code to work here before Twilio is set up (see the warning on that var in `.env.local.example` — remove it once Twilio is real).
   - `NEXT_PUBLIC_APP_URL` — the `*.vercel.app` URL Vercel gives you (or your custom domain, once attached).
4. Deploy. Every subsequent push to `main` auto-deploys.
5. (Optional) **Project Settings → Domains** to attach a custom domain/subdomain — Vercel handles the DNS instructions directly and doesn't have the nameserver-delegation requirement Hostinger's Node.js panel does, so this is usually far simpler if you want `tracker.webcraftedsolutions.com` pointed here instead.

## Deploying to Hostinger (Business plan, Node.js app)

This is best-effort guidance based on how Hostinger's Node.js hosting generally works — confirm the exact steps against your hPanel, since the UI can vary by plan/region.

1. **Database**: nothing to do on Hostinger for this — Supabase is a separate hosted Postgres service, not something you provision through hPanel, and it only holds the `personal_tracker_users` table.
2. **Node.js app**: hPanel → Advanced → Node.js → Create Application.
   - Node.js version: 20 LTS (or newer available).
   - Application root: the folder you upload/deploy this project into.
   - Application startup file: `server.js` (the custom entry point included in this repo — Hostinger's Passenger-based Node hosting expects a single file to `require`/start, not an arbitrary npm script).
3. Upload the project (Git deploy if available, otherwise zip/File Manager or SFTP), then in the Node.js app screen run `npm install` and `npm run build` (Hostinger's panel usually has an "NPM Install" button; if it doesn't also expose a build step, SSH in and run `npm run build` manually before starting the app).
4. Set environment variables in the Node.js app's **Environment variables** section — same keys as `.env.local.example`.
5. Start/restart the app from hPanel. It should now be reachable on your domain.

## Verification checklist

- Log in with a real mobile number, receive the SMS, verify it.
- New number → complete onboarding → land on `/dashboard` → confirm `/settings` shows a "Getting started since" date.
- Add/complete/delete a task, add/edit/delete a goal, log water, log sleep — reload the page and confirm everything persisted (this is IndexedDB now, so check DevTools → Application → IndexedDB → `pt-<yourUserId>` to see it directly).
- Log out, log back in with the same number → confirm your on-device data is still there (it's tied to the browser/device, not the login itself — logging in on a *different* device starts with an empty local database until you restore a Drive backup).
- Visit `/admin/login` with a non-allowlisted number → expect a rejection. Visit with an allowlisted number → expect the OTP to send and land you on `/admin` with the user list (no task/goal/water/sleep data visible there).
- In Settings, connect Google Drive and hit "Back up now" → check the Google Account's [connected apps](https://myaccount.google.com/permissions) shows this app has Drive access; on a second device/browser, "Restore from Drive" should bring your data across.
- Complete a goal, hit "Share" on it → confirm only the title/date shows up in the share sheet/clipboard, nothing else.
- Open Chrome DevTools → Application tab → confirm the manifest and service worker are registered (PWA installable).
