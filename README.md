# Subscription Tracker App

A simple personal-use web app for tracking paid subscriptions, renewal dates, and estimated monthly/yearly spend.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- SQLite-compatible libSQL database
- `@libsql/client`
- Turso for production
- Vercel-ready deployment

## Features

- Single-user password login using `APP_PASSWORD`
- Secure HTTP-only session cookie signed with `SESSION_SECRET`
- Protected dashboard and subscription pages
- Add, edit, view, search, filter, sort, and delete subscriptions
- Active, paused, and cancelled subscription status
- Upcoming renewals within 7 and 30 days
- Monthly and yearly spend estimates
- Local libSQL file for development, remote Turso database for production

## Install

```bash
npm install
```

## Environment Variables

Copy the example file:

```bash
cp .env.example .env.local
```

For local development, this works:

```bash
TURSO_DATABASE_URL="file:local.db"
TURSO_AUTH_TOKEN=""
APP_PASSWORD="your-private-password"
SESSION_SECRET="replace-with-a-long-random-secret"
```

Generate a strong session secret with:

```bash
openssl rand -base64 32
```

Production on Vercel must use a remote Turso/libSQL database. Do not use `file:local.db` on Vercel.

## Database Setup

Run the migration:

```bash
npm run db:migrate
```

Add sample subscriptions:

```bash
npm run db:seed
```

The seed script creates:

- Netflix
- Spotify
- GitHub Copilot
- ChatGPT
- Vercel

## Turso Setup

Create a Turso database:

```bash
turso db create subscription-tracker
```

Get the database URL:

```bash
turso db show --url subscription-tracker
```

Create an auth token:

```bash
turso db tokens create subscription-tracker
```

Set these in `.env.local` when you want to run against Turso locally:

```bash
TURSO_DATABASE_URL="libsql://your-database.turso.io"
TURSO_AUTH_TOKEN="your-token"
```

Then run:

```bash
npm run db:migrate
npm run db:seed
```

References:

- Turso TypeScript quickstart: https://docs.turso.tech/sdk/ts/quickstart
- Turso database creation: https://docs.turso.tech/cli/db/create
- Turso on Vercel: https://docs.turso.tech/integrations/vercel

## Run Locally

```bash
npm run dev
```

Open `http://localhost:3000`, sign in with `APP_PASSWORD`, and manage your subscriptions.

## Deploy to Vercel

1. Push this project to a Git repository.
2. Import the repository in Vercel.
3. Add these environment variables in Vercel:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `APP_PASSWORD`
   - `SESSION_SECRET`
4. Run `npm run db:migrate` against the Turso database before using the production app.
5. Deploy.

The app automatically uses the Vercel-compatible `@libsql/client/web` entrypoint for remote Turso URLs and the normal local client for `file:` development databases.

## Scripts

```bash
npm run dev        # start local Next.js dev server
npm run build      # production build
npm run start      # start production server
npm run lint       # run ESLint
npm run typecheck  # run TypeScript checks
npm run db:migrate # create database tables/indexes
npm run db:seed    # seed sample subscriptions
```

## Billing Calculations

- Monthly: monthly = price, yearly = price × 12
- Yearly: monthly = price ÷ 12, yearly = price
- Weekly: monthly = price × 4.345, yearly = price × 52
- Quarterly: monthly = price ÷ 3, yearly = price × 4
- Custom: monthly and yearly estimates are based on the custom interval in days
