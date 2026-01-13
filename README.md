# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/f3382591-66bf-4600-87e4-320e8acefed5

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/f3382591-66bf-4600-87e4-320e8acefed5) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: (Optional) Create a .env.local file for local environment variables.
# Example .env.local:
# VITE_GA_MEASUREMENT_ID=G-XXXXXXX
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (for API routes only)
# Note: If VITE_GA_MEASUREMENT_ID is not set, Google Analytics will not load (no errors).

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/f3382591-66bf-4600-87e4-320e8acefed5) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Visitor Analytics (First-party)

This project includes first-party visitor analytics that tracks page views and basic attribution without exposing Supabase service role keys to the browser.

### Setup

1. **Run the Supabase migration:**
   - Apply the migration file: `supabase/migrations/20251215000000_add_page_views_tracking.sql`
   - This creates the `page_views` table and RPC functions for aggregating data

2. **Configure Vercel environment variables:**
   - `SUPABASE_URL` (or `VITE_SUPABASE_URL`) - Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (never expose this to the client)

3. **Local development:**
   - Create `.env.local` with:
     ```
     VITE_SUPABASE_URL=https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key
     SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
     ```
   - The API route at `/api/track` uses `SUPABASE_SERVICE_ROLE_KEY` to write to Supabase

### How it works

- **Client-side tracking:** `src/lib/visitorAnalytics.ts` tracks page views on route changes
- **Server-side API:** `/api/track.ts` receives tracking data and writes to Supabase using service role key
- **Admin dashboard:** `/admin/analytics` shows aggregated visitor metrics with date range toggles (24h/7d/30d)

### Verifying tracking

1. Open DevTools → Network tab
2. Filter for `/api/track`
3. Navigate to different pages on the public site
4. You should see POST requests to `/api/track` on each navigation
5. Check the `page_views` table in Supabase to see recorded events

### Security

- Service role key is **never** exposed to the browser
- RLS is enabled on `page_views` table - only service role can insert
- RPC functions require authentication and check for admin role
- Client-side tracking skips `/admin` and `/go/` routes
