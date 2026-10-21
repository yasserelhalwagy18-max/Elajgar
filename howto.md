# How to Upload and Run Elajgar on Your Webhost

This guide walks you through uploading this Next.js application to a webhost and getting it live.

## 1. What You Need Before Starting

- A webhosting account that supports Node.js (cPanel with "Setup Node.js App", VPS, or any Node.js-capable host).
- A MySQL database (`prisma/schema.prisma` uses `provider = "mysql"`).
- Node.js installed on your computer (to build locally).
- Your domain pointing to the host.

## 2. Build the Project on Your Computer

It is recommended to build locally, since shared hosts often have limited memory and CPU.

Open a terminal inside the project folder and run:

```bash
npm install
npx prisma generate
npm run build
```

When finished, a `.next` folder will be created.

## 3. Files to Upload

Zip (do not include `node_modules`):

- `.next/`
- `prisma/`
- `public/`
- `package.json`
- `package-lock.json`
- `server.js`
- `next.config.ts`
- `.env.exsample` (rename to `.env` after upload and fill in values)

Upload the zip to your host's application root folder and extract it.

## 4. Environment Variables

On your host, set these environment variables (via cPanel "Setup Node.js App" environment variables, or your host's equivalent):

- `NODE_ENV=production`
- `PORT=3000`
- `DATABASE_URL=<your database connection string>`
- `JWT_SECRET=<a long random string>`

The `DATABASE_URL` format is:

```
mysql://USERNAME:PASSWORD@localhost:3306/DATABASENAME
```

If you want to use PostgreSQL (e.g. Supabase, Neon) you must change
`provider` in `prisma/schema.prisma` to `postgresql` **and** use a PostgreSQL
connection string. The two must match.

For the OTP login you also need (see `.env.exsample`):

```
SMSIR_API_KEY=...
SMSIR_TEMPLATE_ID=...
SMSIR_CODE_PARAM=CODE
```

## 5. Database Setup

On the host terminal (inside your project folder, after activating the Node.js environment):

```bash
npm install --production
npm run db:generate
npm run db:push
```

These scripts load `.env.local` when it exists and `.env` otherwise, so they
pick up the `DATABASE_URL` you created above. The plain `npx prisma` command
only reads `.env`, which is why the scripts go through `scripts/prisma.mjs`.

`prisma db push` creates the database tables from your schema. Run it again
after any change to `prisma/schema.prisma` — it only applies the difference
and never drops data.

### Seed the food database (optional but recommended)

The food search needs rows in the `Food` table:

```bash
npm run db:seed
```

The seed also writes the partner gyms, the editorial content (articles,
exercises) and the default health-score settings.

### Create an admin account

The admin panel is at `/admin`. It needs an account with the `ADMIN` role, and
there is no way to get that role through the app - the OTP login always
creates a regular user. Provision it with the seed:

```bash
ADMIN_PHONE=09123456789 npm run db:seed
```

Set `ADMIN_PHONE` (or `ADMIN_PHONES` for several admins) in `.env` so the
seed picks it up on every run.

For a database that is already seeded, promote an existing user instead:

```bash
npm run admin:promote 09123456789
```

The user must have signed in at least once, so that the account exists.

## 6. Start the Application

Start the app with:

```bash
npm start
```

Or in cPanel, click **Restart** on your Node.js app after setting the startup file to `server.js`.

Then open your domain in a browser. The site should be live.

## 7. Updating Later

When you change code:

1. Rebuild locally: `npm run build`
2. Upload only the changed files (usually just the `.next` folder)
3. Extract on the host
4. Restart the app in your host dashboard

## Troubleshooting

- **503 error / site won't load:** Check `stderr.log` in your project folder on the host.
- **Database errors:** Verify `DATABASE_URL` and that `prisma db push` was run.
- **Missing images:** Ensure `next.config.ts` `images.remotePatterns` includes the hostnames you use for images.
- **Build fails on host:** Build locally instead and upload the compiled `.next` folder only.
