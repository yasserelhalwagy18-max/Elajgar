# How to Upload and Run Elajgar on Your Webhost

This guide walks you through uploading this Next.js application to a webhost and getting it live.

## 1. What You Need Before Starting

- A webhosting account that supports Node.js (cPanel with "Setup Node.js App", VPS, or any Node.js-capable host).
- A database (PostgreSQL or MySQL, depending on your `prisma/schema.prisma` provider).
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
- `.env.example` (rename to `.env` after upload and fill in values)

Upload the zip to your host's application root folder and extract it.

## 4. Environment Variables

On your host, set these environment variables (via cPanel "Setup Node.js App" environment variables, or your host's equivalent):

- `NODE_ENV=production`
- `PORT=3000`
- `DATABASE_URL=<your database connection string>`
- `JWT_SECRET=<a long random string>`

If using cPanel MySQL, the `DATABASE_URL` format is:

```
mysql://USERNAME:PASSWORD@localhost:3306/DATABASENAME
```

If using PostgreSQL (e.g. Supabase, Neon), keep the provider as `postgresql` in `prisma/schema.prisma` and use the PostgreSQL connection string instead.

## 5. Database Setup

On the host terminal (inside your project folder, after activating the Node.js environment):

```bash
npm install --production
npx prisma generate
npx prisma db push
```

`prisma db push` creates the database tables from your schema. Run this once when you first deploy.

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
