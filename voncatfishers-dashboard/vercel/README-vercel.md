# Deploying to Vercel (static site) with Supabase

1. Create a Supabase project at https://supabase.com. In the SQL editor run `supabase/init.sql` (copy-paste the file contents). This creates tables and seeds the accounts you provided.

2. Copy `js/config.example.js` -> `js/config.js` and fill with:
   - SUPABASE_URL: your Supabase project's URL (e.g. https://xyzcompany.supabase.co)
   - SUPABASE_ANON_KEY: the project's public anon key from Project Settings -> API

   Example:
   export const CONFIG = { SUPABASE_URL: 'https://xyz.supabase.co', SUPABASE_ANON_KEY: 'public-anon-key' }

   **Important**: For production it's better to use environment variables and a build pipeline. This repo uses a small static config file for simplicity.

3. Create a GitHub/GitLab repo with this project and connect it to Vercel, or drag & drop the folder into Vercel.

4. If you want to avoid checking `js/config.js` into git, set up a simple build step that injects env vars into `js/config.js` from Vercel's Environment Variables. Example build command (in Vercel project settings): 
   ```
   bash -lc "cat > js/config.js <<'EOF'
export const CONFIG = { SUPABASE_URL: '$SUPABASE_URL', SUPABASE_ANON_KEY: '$SUPABASE_ANON_KEY' } 
EOF"
   ```
   and set the Environment Variables `SUPABASE_URL` and `SUPABASE_ANON_KEY` in Vercel's dashboard.

5. Deploy. After deploy, open `/index.html`. Use the seeded accounts to login.

6. Notes:
   - This project does not use Supabase Auth. It queries a `users` table directly (simple prototype).
   - For a production-ready app, implement proper authentication (Supabase Auth), hash passwords, add RLS policies, and never store secrets in frontend code.

