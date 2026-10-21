# Elajgar (علاج‌گر)

A Next.js app for pain assessment, corrective exercise and nutrition tracking.

## Run Locally

**Prerequisites:** Node.js 20+, a MySQL database

1. Install dependencies:
   `npm install`
2. Copy the env template and fill in the values:
   `cp .env.exsample .env.local`
3. Create the tables and generate the client:
   `npm run db:push`
4. Seed the food database, the gyms and the editorial content:
   `npm run db:seed`
5. Run the app:
   `npm run dev`

The Prisma CLI only reads `.env`, while Next.js reads `.env.local` first. The
`npm run db:*` scripts go through `scripts/prisma.mjs`, which loads
`.env.local` when it exists and falls back to `.env`, so the same commands work
locally and on the host.

## Check that everything is wired up

```bash
npm run db:doctor
```

One command that verifies the environment variables, the database connection,
that the schema matches `prisma/schema.prisma`, that an account can open the
admin panel, that the Prisma client is up to date, and that the SMS provider
is reachable and still has credit. It is the fastest way to find out what is
broken after a deploy or a host migration.

> **Aiven free tier:** the MySQL service is powered off automatically after a
> period of inactivity. When that happens the app reports "Can't reach
> database server" and `npm run db:doctor` fails the database check. Log in to
> the Aiven console, press **Power on** for the service, and run
> `npm run db:doctor` again.
>
> The app repairs its own connection pool when the database comes back, so
> there is no need to restart it - the first request after the service is
> powered on takes a few seconds longer, and then everything works again.

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
