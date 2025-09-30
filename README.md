# OhkaySports Platform

This repository contains source code and documentation for the OhkaySports Platform, a privacy-first, athlete-driven application for uploading, parsing, visualizing and managing sports competition results.

## Overview

The core goal of OhkaySports is to give athletes and organizers a secure and transparent way to manage competition results. It uses Supabase for authentication and data storage, and offers features such as:

- Seedphrase-based login (OSID) with an upload requirement to activate accounts.
- Competition setup with custom metadata (name, year, sport, venue, etc.).
- Athlete profiles with optional fields for date of birth, gender, athlete status and a personal identity statement.
- Secure result parsing and dashboards (to be implemented).

## Current status

This repository now ships with a full Next.js proof-of-concept for the **SEA Games 2025 Fantasy League**. The dashboard showcases how to read and write Supabase data for fantasy athletes, events, rosters and leaderboards. It lives in the `app` directory and can be launched locally to preview the experience with live Supabase tables.

Key frontend modules include:

- `app/` – App Router entry point and global layout/styles.
- `components/FantasyLeagueDashboard.tsx` – Client component that renders the fantasy league hub, including the athlete pool, roster management and leaderboard.
- `config/fantasyLeagueConfig.ts` – Central place to override Supabase table names and hero copy.
- `lib/supabaseClient.ts` – Browser-side Supabase client configured via environment variables.
- `ohkaysports_components.tsx` – Existing profile and competition management forms that can still be embedded elsewhere in the product.

## Getting started

To develop locally:

1. Clone this repository.
2. Install dependencies: `npm install`
3. Create a `.env.local` file with your Supabase project credentials:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
   # Optional: override default table names if your schema differs
   NEXT_PUBLIC_SUPABASE_TABLE_ATHLETES=fantasy_athletes
   NEXT_PUBLIC_SUPABASE_TABLE_EVENTS=fantasy_events
   NEXT_PUBLIC_SUPABASE_TABLE_TEAMS=fantasy_teams
   NEXT_PUBLIC_SUPABASE_TABLE_PICKS=fantasy_team_picks
   NEXT_PUBLIC_SUPABASE_TABLE_LEADERBOARD=fantasy_leaderboard_view
   ```

4. Start the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) to explore the fantasy league dashboard.

The proof of concept reads from and writes to the Supabase tables listed above. As soon as you connect your Supabase project the athlete pool, event schedule, roster builder and leaderboard cards will hydrate with real data.

## Additional components

The original `ohkaysports_components.tsx` file remains available. It contains:

- `ProfileForm` – Upserts a logged-in user's profile details into the `profiles` table.
- `CreateCompetitionForm` – Inserts new competition metadata into the `competitions` table.

You can import these components into the Next.js app (or any other React project) if you need the legacy profile and competition management flows alongside the fantasy league proof of concept.

## Contributing

If you're new to Git and GitHub, here are the basic steps to create your first commit:

```sh
git init                # Initialize the repository
git add .              # Stage all changes
git commit -m "Initial commit"  # Commit with a message
```

After creating a repository on GitHub:

```sh
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

Please refer to GitHub's documentation for more guidance on using Git and collaborating on repositories.
