# forge/ — Setup Guide

## 1. Run the app locally (no Supabase needed yet)
```
npm install
npm run dev
```
Open http://localhost:3000 — onboarding and all pages work with mock data.

---

## 2. Set up Supabase (for real auth + database)

### Step 1 — Create a free Supabase project
1. Go to https://supabase.com and sign up (free)
2. Click "New Project"
3. Give it a name (e.g. "forge"), pick a region close to you, set a DB password
4. Wait ~2 min for it to spin up

### Step 2 — Run the database schema
1. In your Supabase dashboard, click "SQL Editor" in the left sidebar
2. Click "New Query"
3. Open the file `supabase_schema.sql` from this project
4. Paste it all in and click "Run"
5. You should see "Success. No rows returned"

### Step 3 — Enable Google Auth
1. In Supabase dashboard → Authentication → Providers
2. Find "Google" and toggle it on
3. You'll need a Google OAuth Client ID and Secret:
   - Go to https://console.cloud.google.com
   - Create a new project (or use existing)
   - Go to APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
   - Application type: Web application
   - Authorized redirect URI: `https://<your-supabase-project>.supabase.co/auth/v1/callback`
   - Copy the Client ID and Secret back into Supabase
4. Save

### Step 4 — Get your API keys
1. In Supabase dashboard → Settings → API
2. Copy:
   - Project URL (looks like `https://xxxx.supabase.co`)
   - anon/public key (long string starting with `eyJ`)

### Step 5 — Add keys to your project
Open the file `.env.local` in the forge folder and replace the placeholders:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 6 — Run again
```
npm run dev
```
Now Google login will work and profiles will be saved to your database.

---

## Mobile layout
The app is responsive. To test it:
- In Chrome, press F12 → click the phone/tablet icon (top left of DevTools)
- Or just open it on your phone at http://YOUR_LOCAL_IP:3000
  (find your IP with `ipconfig` in PowerShell, look for IPv4 Address)

---

## Adding GitHub Login

1. In Supabase dashboard → Authentication → Providers → find GitHub, toggle on
2. Go to https://github.com/settings/developers → OAuth Apps → New OAuth App
3. Set:
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `https://<your-supabase-project>.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret into Supabase
5. Save — GitHub login now works alongside Google

---

## Adding Messaging (run in SQL Editor)

If you already ran the schema, run just the messages section at the bottom of `supabase_schema.sql`.

Also enable Realtime for the messages table:
1. Supabase dashboard → Database → Replication
2. Find `messages` table and toggle it on
