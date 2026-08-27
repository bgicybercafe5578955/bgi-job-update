# BGI Job Update

A modern, mobile-responsive job update portal for India, built with Next.js 14 (App Router), TypeScript and Tailwind CSS. Ships with sample job data so it runs immediately.

## Quick Start

```bash
npm install
npm run seed      # (re)generates dummy job data in data/jobs.json
npm run dev
```

Visit http://localhost:3000

**Admin panel:** http://localhost:3000/admin/login
- Username: `admin`
- Password: `BgiAdmin@123`

## What's included

- Public site: homepage, filterable job listing, job details pages, Admit Card / Results / Answer Key / Syllabus / Contact / About / legal pages
- Server-side eligibility filtering (gender, category, qualification, job type, state, age, last-date window) — never done in the browser
- Admin panel: dashboard stats, manage jobs (edit/delete/feature/expire), Add/Edit Job form with checkboxes and a rich text editor — no coding required to publish a job
- SEO: per-job metadata, Open Graph tags, JobPosting JSON-LD schema, auto-generated `sitemap.xml` and `robots.txt`
- Public JSON API at `/api/jobs` for filtered job data

## Data storage (demo vs. production)

Out of the box, jobs are stored in `data/jobs.json` and read/written by `lib/db.ts`. This lets you test everything immediately with zero setup. Every filter/query in the app goes through the functions in `lib/db.ts`, so moving to a real database means rewriting the *inside* of that one file — nothing else in the app needs to change.

To move to PostgreSQL / Supabase:
1. Run `schema.sql` against your database (includes indexes tuned for the eligibility filters, plus an example query).
2. Replace the file-read/write logic in `lib/db.ts` with SQL queries using the same function names and return shapes.
3. Set `DATABASE_URL` (or your Supabase connection details) as an environment variable and connect using `pg` or the Supabase client.

## Environment variables

Copy `.env.example` to `.env.local` and adjust:

- `NEXT_PUBLIC_SITE_URL` — your production domain, used in SEO tags and sitemap
- `ADMIN_USERNAME` / `ADMIN_PASSWORD_HASH` — admin login (see comment in file for generating a hash)
- `ADMIN_SESSION_SECRET` — long random string used to sign admin session cookies

## Adding jobs day-to-day

Go to `/admin/jobs/new`. Every field is a checkbox, dropdown, date picker or simple text field — ticking "Female" + "SC" + "ST" + "Graduate" on a job is all that's needed for it to automatically show up when a user filters by any of those combinations on the public site. No code edits required.

## Deployment

This is a standard Next.js app — deploy to Vercel, Netlify, or any Node host:

```bash
npm run build
npm start
```

Note: the demo JSON data store writes to the local filesystem, which does **not** persist on most serverless hosts (e.g. Vercel's filesystem is read-only/ephemeral at runtime). For a real deployment, complete the PostgreSQL/Supabase migration described above before adding real job data.
