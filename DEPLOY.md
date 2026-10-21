# Putting elajgar.ir online with Liara

This is the whole thing, from nothing to a live site. It should take about
30 minutes.

**What you need before you start**

- A Liara account: <https://console.liara.ir>
- The domain `elajgar.ir` (you already have it)
- The sms.ir key and template (you already have these)
- A credit balance on sms.ir, otherwise the login code is never delivered

---

## 1. The database

The app needs a MySQL that the server can reach. Your computer's MySQL cannot
be used - it is not on the internet.

**Create one on Liara** (it is in the same data centre as the app, so it is
fast):

1. In the console, go to **دیتابیس‌ها** (Databases) and press **ایجاد
   دیتابیس** (Create database).
2. Choose **MySQL**, give it a name and the smallest size that fits.
3. When it is ready, press **لینک اتصال** (connection link) to see the
   address. It looks like this:

   ```
   mysql://USER:PASSWORD@HOST:PORT/DATABASE
   ```

4. **Copy it.** This is the `DATABASE_URL` for the server.

> **Put the app and the database in the same private network** if you can:
> create the app with a **شبکه خصوصی** (private network) and choose the
> same network for the database. The address then points inside Liara's own
> network - it is faster, and the traffic never goes out to the internet.

---

## 2. The app

1. In the console, press **ایجاد برنامه** (Create app).
2. Choose the **NextJS** platform.
3. The port is **3000** (the `liara.json` in this project says the same).
4. The Node version is **22** (or 20, or 24 - all three work).
5. The build location is **Iran**, which is the default.

> If you would rather not create the app by hand, `liara deploy` creates it
> for you from the `liara.json` in this project.

---

## 3. The environment variables

These are the settings the server needs. They are **not** in the project
folder - they are set on the server.

In the console: open your app → **تنظیمات** (Settings) → **متغیرها**
(Env vars) → add these:

| Name | Value |
| --- | --- |
| `DATABASE_URL` | The MySQL address from step 1, with `?connection_limit=10&connect_timeout=30` at the end |
| `JWT_SECRET` | A new random string - see below |
| `ADMIN_PHONE` | Your phone number, e.g. `09123456789` |
| `SMSIR_API_KEY` | Your sms.ir key |
| `SMSIR_TEMPLATE_ID` | Your sms.ir template number |
| `SMSIR_CODE_PARAM` | `CODE` |

To make a new `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

> The full list with an explanation of each one is in
> `.env.production.example`.

---

## 4. Upload the app

### The easy way - the CLI

```bash
npm install -g liara
liara login
liara deploy --port 3000
```

The CLI reads `.liaraignore` and skips everything that should not be
uploaded. Watch the output - it runs `npm install`, `npm run build` and then
starts the app.

### The other way - the console

If you would rather drag a file into the browser:

```bash
npm run deploy:zip
```

That builds the app and writes `deploy/elajgar.zip`. Then:

1. In the console, open your app → **استقرار جدید** (New deployment)
2. **Drag & Drop** the zip
3. Press **استقرار** (Deploy)

---

## 5. What happens on the first start

Liara runs `liara_pre_start.sh` before it starts the app. That file:

1. builds the Prisma client **on Liara's server** - the one built on your
   computer is for Windows and would not load there
2. creates the tables in the database (`prisma db push`)
3. fills the database with the foods, the articles, the exercises, the plans
   and the settings, and gives your `ADMIN_PHONE` the admin role

All three are safe to run again on every restart - the seed only adds what is
missing.

---

## 6. The domain

1. In the console, open your app → **دامنه‌ها** (Domains) → **افزودن
   دامنه** (Add domain) → type `elajgar.ir` → **ایجاد دامنه**.
2. You are taken to the domain page. It shows **three DNS records**:
   - an **ALIAS / CNAME** record for the domain itself
   - a **TXT** record, to prove you own the domain
   - a **CNAME** record, for the SSL certificate check (DNS-01)
3. Put those three records in the place where your domain's nameservers are
   set. For a `.ir` domain that is **ایرنیک (IRNIC)**: <https://www.nic.ir>
   - if the domain uses **Liara's own DNS**, the records are added for you -
     just press the button that syncs them
   - if the domain uses another DNS (Cloudflare, Abonarvan, ...), add the
     three records there by hand
4. Go back to the domain page and press **بررسی وضعیت رکوردها** (check the
   records). The ticks turn from red to green when the domain points at
   Liara. This can take a few minutes, sometimes a few hours.
5. When the ticks are green, press **تهیه گواهی SSL** (get the SSL
   certificate). It is free and it renews itself.

---

## 7. Check it

Open **https://elajgar.ir** - you should see the landing page.

- The login works: type your number, get the code, sign in
- The admin panel is at **/panel-7x9k4m**, not at `/admin`
- Sign in with the number in `ADMIN_PHONE`

If something is wrong, the console has the logs: your app → **تاریخچه**
(history) → the log of the last deployment. The `liara_pre_start.sh` output
is at the top of it.

---

## Updating the app later

```bash
git pull              # or whatever brings the new code in
npm run deploy:zip    # or: liara deploy --port 3000
```

The same steps as step 4. The database is left alone - the schema is brought
up to date by `liara_pre_start.sh`.

---

## Before the real launch

Development accounts and the development admin path must not go live. The
full list is in the README under **"Before you go live"**. The short
version:

- [ ] Delete the test user `09121512173` and change the admin's password
- [ ] Change the admin path in `lib/admin-path.ts` and rename the folder
      in `app/`
- [ ] Top up the sms.ir balance
- [ ] Put a real `JWT_SECRET` in the console (not the development one)

---

## If something goes wrong

| What you see | What it is | What to do |
| --- | --- | --- |
| `Can't reach database server` | The database is unreachable from the app | Check the `DATABASE_URL` in the console, and that the database is started |
| `All elements of the array need to be Prisma Client promises` | The Prisma client was not built on the server | `liara_pre_start.sh` did not run - check the deployment log |
| The site does not open at all | The domain records have not propagated | Wait, and check the ticks on the domain page |
| `EPERM ... query_engine` | You ran `db:generate` while the app was running | Stop the app first |
| The login code never arrives | The sms.ir balance is empty | Top it up, and check `SMSIR_API_KEY` |
