# VonCatfishers — Next.js + Tailwind Professional Dashboard

## What this is
A Next.js (v14) + TailwindCSS dashboard for two roles: **admin** and **model**.
Supabase is used as the backend database. This project is Vercel-ready.

## Quickstart (local)
1. Install dependencies:
   ```
   npm install
   ```
2. Create a `.env.local` file in project root:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Run locally:
   ```
   npm run dev
   ```
4. Run the SQL in `supabase/init.sql` in your Supabase project's SQL editor to create tables and seed accounts.

## Deploy to Vercel
- Push this repo to GitHub.
- In Vercel, create a New Project and import the repo.
- Set Environment Variables in Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Build & Deploy. Vercel will run `npm run build`.

## Notes & security
- This prototype uses a `users` table with plaintext passwords for direct credential checks (as requested). This is insecure — for production use Supabase Auth and hashed passwords.
