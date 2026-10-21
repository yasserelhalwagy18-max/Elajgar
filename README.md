# Elajgar (علاج‌گر)

A Next.js app for pain assessment, corrective exercise and nutrition tracking.

## Run Locally

**Prerequisites:** Node.js 20+, a MySQL database (Docker, or a MySQL 8
service installed on the machine)

1. Install dependencies:
   `npm install`
2. Start the database:
   `docker compose up -d`
3. Copy the env template and fill in the values:
   `cp .env.exsample .env.local`
4. Create the tables and generate the client:
   `npm run db:push`
5. Seed the food database, the gyms and the editorial content:
   `npm run db:seed`
6. Run the app:
   `npm run dev`

The Prisma CLI only reads `.env`, while Next.js reads `.env.local` first. The
`npm run db:*` scripts go through `scripts/prisma.mjs`, which loads
`.env.local` when it exists and falls back to `.env`, so the same commands work
locally and on the host.

### The local database

`docker-compose.yml` runs MySQL 8 with the settings the app needs:

- `utf8mb4` with the `utf8mb4_unicode_ci` collation, so the Persian text
  stores correctly and `contains` searches stay case-insensitive the way they
  are on a hosted server.
- A named volume, so the data survives `docker compose down`.
- A health check, so `db push` is never run against a server that is still
  starting up.

The container listens on **3307**, because MySQL is often already installed on
Windows and holds 3306. If you would rather use the MySQL you already have,
point `DATABASE_URL` at 3306 and skip the container entirely:

```sql
-- run once, as the MySQL root user
CREATE DATABASE elajgar CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'elajgar'@'%' IDENTIFIED BY 'elajgar';
GRANT ALL PRIVILEGES ON elajgar.* TO 'elajgar'@'%';
```

To start over from an empty database:

```bash
docker compose down -v && docker compose up -d && npm run db:push && npm run db:seed
```

### The font

The Vazirmatn font is self-hosted from the `@fontsource/vazirmatn` package
(see `lib/fonts.ts`). It used to come from Google Fonts, which meant the
build failed on any machine that could not reach `fonts.googleapis.com` - a
lot of networks block it, and `next build` treats the failure as an error
while `next dev` only warns. It also meant every visitor's browser fetched
the font from Google, which is slow for users on the same kind of network.

Nothing has to be downloaded for a build now.

## Check that everything is wired up

```bash
npm run db:doctor
```

One command that verifies the environment variables, the database connection,
that the schema matches `prisma/schema.prisma`, that an account can open the
admin panel, that the Prisma client is up to date, and that the SMS provider
is reachable and still has credit. It is the fastest way to find out what is
broken after a deploy or a host migration.

> **A hosted free tier can go away.** An Aiven free-tier MySQL, for example,
> is powered off automatically after a period of inactivity. When that happens
> the app reports "Can't reach database server" and `npm run db:doctor` fails
> the database check. Log in to the provider's console, press **Power on** for
> the service, and run `npm run db:doctor` again.
>
> The app repairs its own connection pool when the database comes back, so
> there is no need to restart it - the first request after the service is
> powered on takes a few seconds longer, and then everything works again.
>
> A local MySQL avoids the whole problem, which is why development uses one.

## The admin panel

`/admin` is the control panel. It needs an account with the `ADMIN` role -
there is no way to become an admin through the app, so it is provisioned out
of band:

```bash
ADMIN_PHONE=09123456789 npm run db:seed
```

The seed creates the account if it does not exist and gives it the role. For a
deployment that is already running, promote an existing user instead:

```bash
npm run admin:promote 09123456789          # grant the role
node scripts/promote-admin.mjs 09123456789 --revoke   # take it away
```

The number has to have signed in at least once, so that the account exists.

What the panel covers:

| Section | What it manages |
| --- | --- |
| `/admin` | Overview: user counts, the pain distribution across all users, the signup trend |
| `/admin/users` | Every user: role, active state, the record, the risk level |
| `/admin/gyms` | The partner gyms in the health network |
| `/admin/foods` | The food database the nutrition screen searches |
| `/admin/content` | Articles, exercises and videos |
| `/admin/settings` | The health score weights and the daily targets |
| `/admin/audit` | Every change an admin made, with the actor and the time |

The settings are stored in the database and read by the health score, so a
change applies to every user rather than to one browser.

## Tests

```bash
npm test          # the whole suite
npm run lint      # eslint
```

## Deploying

See [howto.md](./howto.md) for the cPanel deployment steps and
[CPANEL_DEPLOYMENT.md](./CPANEL_DEPLOYMENT.md) for the server configuration.
