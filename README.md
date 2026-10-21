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

## Signing in

There are three ways in:

- **An SMS code.** This is how everybody signs in the first time, and it is
  the only way to get an account.
- **A password.** After the first sign-in the app offers to create one, so
  from then on the user can sign in without waiting for a message. The
  password can be set or changed in **Profile → Password**.
- **The SMS code, again.** The password is optional - the code always works.

The password is stored as a `scrypt` hash in its own table, never next to
the user record, so it cannot leak into a query that returns a user. Signing
in with a password is rate limited, and an unknown number and a wrong
password give exactly the same answer, so the form cannot be used to find
out which phone numbers have an account.

> **On Windows, stop the app before `npm run db:generate`.** The Prisma query
> engine is a `.dll` that the running process holds open, so the generate
> fails with `EPERM: operation not permitted, rename ... query_engine-*.dll`.
> The fix is to stop the dev server (or the app on the host) and run it again.
> `npm run db:doctor` tells you when the generated client has fallen behind
> the schema.

## The PWA

The app can be installed on a phone and opens like a normal app.

- `public/manifest.json` - the name, the colours and the icons.
- `public/icon.svg` - the source of the icons. The PNGs the manifest points
  at are generated from it with `npm run icons:generate`.
- `public/sw.js` - the service worker.
- `public/offline.html` - the page shown when there is no connection.

**Nothing that belongs to a user is ever cached.** The API answers with the
caller's own health record, so the worker sends every `/api/` request to the
network and stores nothing. The pages are not cached either. What is cached
is the static files - the ones Next.js serves with a content hash in their
name - and the icons, so the app opens and shows its shell with no
connection.

The worker is only registered in a production build, so it cannot serve an
old build while Next.js is making a new one during development. To try it
locally:

```bash
npm run build && npm start
```

Then open the site in Chrome and use **Install app** in the address bar.

> **A note on `output: 'standalone'`:** the standalone server does not
> copy `public/` or `.next/static/` for you. If you ever run
> `node .next/standalone/server.js` instead of `npm start`, copy them across
> first, or the icons, the service worker and the offline page will be
> missing:
>
> ```bash
> cp -r public .next/standalone/
> cp -r .next/static .next/standalone/.next/
> ```

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

The panel is at **`/panel-7x9k4m`**, not at `/admin`. The path is set in
`lib/admin-path.ts`, and the folder in `app/` has to have the same name. A
scanner that finds the login form would try `/admin` first, and a panel that
answers there tells the world it exists - so the path is deliberately
unguessable. The **role check is what actually protects it**; the unusual
path is only the first line of defence.

The path can be changed:

1. rename the folder in `app/` to the new path
2. change `ADMIN_PATH` in `lib/admin-path.ts`
3. the middleware reads `ADMIN_PATH` too, so nothing else needs changing

The panel needs an account with the `ADMIN` role - there is no way to become
an admin through the app, so it is provisioned out of band:

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
| `/panel-7x9k4m` | Overview: user counts, the pain distribution across all users, the signup trend |
| `/panel-7x9k4m/users` | Every user: role, active state, the record, the risk level |
| `/panel-7x9k4m/gyms` | The partner gyms in the health network |
| `/panel-7x9k4m/foods` | The food database the nutrition screen searches |
| `/panel-7x9k4m/content` | Articles, exercises and videos |
| `/panel-7x9k4m/settings` | The health score weights and the daily targets |
| `/panel-7x9k4m/audit` | Every change an admin made, with the actor and the time |

The settings are stored in the database and read by the health score, so a
change applies to every user rather than to one browser.

## Before you go live

Development accounts and the development admin path are **not** for
production. Check this list before the real launch:

- [ ] **Delete the test accounts.** The accounts created for development -
      the admin `09369913228` and the test user `09121512173` - both have the
      password `13474393`. Remove the test user with:
      ```bash
      npm run admin:delete 09121512173
      ```
      and change the admin's password from **Profile → Password**. If you
      would rather keep the account but take away its password:
      ```bash
      npm run admin:clear-password 09121512173
      ```
- [ ] **Change the admin path.** `/panel-7x9k4m` is a development path.
      Pick a new one: rename the folder in `app/`, change `ADMIN_PATH` in
      `lib/admin-path.ts`, and rebuild. The role check protects the panel
      either way - the path only keeps scanners away.
- [ ] **Check `ADMIN_PHONE` in `.env`.** It is the number the seed turns
      into an admin on every run.
- [ ] **Check the sms.ir balance** with `npm run db:doctor` - a top-up is
      needed for the login code to be delivered.
- [ ] **Move off the development database.** The local MySQL is for
      development; production needs its own, with its own `DATABASE_URL`.
- [ ] **Rotate the secrets.** `JWT_SECRET` in `.env` is the one from
      development. Give production a new one:
      ```bash
      node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
      ```

## Tests

```bash
npm test          # the whole suite
npm run lint      # eslint
```

## Deploying

See [howto.md](./howto.md) for the cPanel deployment steps and
[CPANEL_DEPLOYMENT.md](./CPANEL_DEPLOYMENT.md) for the server configuration.
