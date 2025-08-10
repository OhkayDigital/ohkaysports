OhkaySports Platform
This repository contains source code and documentation for the OhkaySports Platform, a privacy‑first, athlete‑driven application for uploading, parsing, visualizing and managing sports competition results.

Overview
The core goal of OhkaySports is to give athletes and organizers a secure and transparent way to manage competition results. It uses Supabase for authentication and data storage, and offers features such as:

Seedphrase‑based login (OSID) with an upload requirement to activate accounts.

Competition setup with custom metadata (name, year, sport, venue, etc.).

Athlete profiles with optional fields for date of birth, gender, athlete status and a personal identity statement.

Secure result parsing and dashboards (to be implemented).

Current Status
This repository currently contains example React components located in ohkaysports_components.tsx that demonstrate how to build a profile form and a competition creation form integrated with Supabase. These components are intended to be part of a larger React or Next.js application.

The initial commit includes:

ohkaysports_components.tsx – Two React components (ProfileForm and CreateCompetitionForm) that interact with Supabase to update a user's profile and create competitions.

Getting Started
To develop locally:

Clone this repository.

Install dependencies: npm install (you will need a React/Next.js setup with Tailwind and @supabase/supabase-js).

Create a .env.local file with your Supabase project URL and anon key:

env
Copy
Edit
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
Import the components from ohkaysports_components.tsx into your pages and integrate them with your routing.

Contributing
If you're new to Git and GitHub, here are the basic steps to create your first commit:

sh
Copy
Edit
git init                # Initialize the repository
git add .              # Stage all changes
git commit -m "Initial commit"  # Commit with a message

# After creating a repository on GitHub:
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
Please refer to GitHub's documentation for more guidance on using Git and collaborating on repositories.
