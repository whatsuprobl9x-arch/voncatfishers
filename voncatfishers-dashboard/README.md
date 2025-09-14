# VonCatfishers Dashboard (Supabase + Vercel)

**What this is**
A simple role-based dashboard (Admins & Models) built as a static frontend that talks to Supabase.  
It uses plain HTML/CSS/JS and the Supabase JS client via CDN. This repo includes SQL you can run in Supabase to create tables and seed the accounts you provided.

**Important security note**
This project stores passwords in plaintext in the `users` table for simplicity (as per your request). This is insecure for any real deployment. Treat this as a minimal prototype only.

---

## Included files (important)
- `index.html` — Login page (black & dark-blue theme). No create account button.
- `dashboard.html` — Shared dashboard UI for Admins and Models.
- `js/config.example.js` — Example config. **Copy to `js/config.js` and fill SUPABASE_URL and SUPABASE_ANON_KEY before deploying.**
- `js/auth.js` — Login + session management.
- `js/admin.js` — Admin-only features (view content, send USD credits, send giftcards, reply to support).
- `js/model.js` — Model-only features (submit content, view balance, request payout, support).
- `css/style.css` — Styles.
- `supabase/init.sql` — SQL you can run in Supabase SQL editor to create tables and seed initial accounts & data.
- `vercel/README-vercel.md` — Step-by-step deployment instructions for Vercel + Supabase.
- `LICENSE` — MIT

---

## Quick local test
1. Open `js/config.example.js`, copy to `js/config.js` and paste your Supabase project URL and anon key.
2. Run a static server (e.g. `python -m http.server 8000`) from the project root and open `http://localhost:8000/index.html`.

---

## Supabase SQL
Run `supabase/init.sql` in your Supabase project's SQL editor (Be sure to **remove any users** you had before if that was desired). This will create public tables and insert the accounts you gave.

---

## Vercel & Supabase notes
See `vercel/README-vercel.md` for detailed instructions on how to deploy this on Vercel and where to put your Supabase keys.

