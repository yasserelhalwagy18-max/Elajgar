# Step-by-Step Guide to Deploying the Elajgar Project on cPanel

This guide is written specifically for beginners who have no prior experience uploading Next.js projects to cPanel hosting.

Your project consists of the following:
- **Next.js**: The main framework for the frontend and parts of the backend (API Routes).
- **Prisma**: The tool used to interact with the database.
- **Database**: Based on your code, it currently uses `PostgreSQL`. However, since most standard cPanel environments only support MySQL, we need to adjust Prisma to use MySQL (explained in the steps below).

---

## Step 1: Change the Database to MySQL (If Needed)
Since typical cPanel setups support MySQL and your current code is configured for PostgreSQL, we must prepare the code for MySQL first.

1. Open the file `prisma/schema.prisma` on your computer.
2. Find the `datasource` section and change the word `"postgresql"` to `"mysql"`:
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```
*Note: If you are using a separate external database server like Supabase or Neon (which are PostgreSQL), you do not need to make this change.*

---

## Step 2: Prepare the cPanel Server for Next.js
Most cPanel hosts use a tool called **Phusion Passenger** to run Node.js applications. This tool specifically looks for a file named `server.js` to start the app.

1. In the root folder of your project, create a new text file named `server.js`.
2. Copy and paste the following code into it and save:

```javascript
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

// Setup port and environment
const port = process.env.PORT || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})
```

---

## Step 3: Build the Project on Your Computer
Because cPanel servers often have memory and CPU limits, it is much safer and faster to build the project on your own computer and upload the compiled files.

1. Open a terminal (Command Prompt / Terminal) on your computer inside your project folder.
2. Run this command to install the necessary packages:
```bash
npm install
```
3. Run this command to generate the Prisma client code:
```bash
npx prisma generate
```
4. Run this command to build your project:
```bash
npm run build
```
Once this command finishes, a folder named `.next` will be created in your project.

---

## Step 4: Zip the Files for Upload
Select the following files and folders and compress them into a single zip file (e.g., `upload.zip`):
- `.next` (folder)
- `prisma` (folder)
- `public` (folder)
- `package.json` (file)
- `package-lock.json` (file)
- `server.js` (the file you created in Step 2)
- `next.config.ts` (file)

**IMPORTANT:** Do **NOT** zip the `node_modules` folder! This folder is too large and will be generated directly on cPanel later.

---

## Step 5: Create a Database in cPanel
If you are using the database provided by cPanel:

1. Log into your cPanel account.
2. Go to the **Databases** section and click on **MySQL® Databases**.
3. Create a new database (Create New Database). Remember the name you gave it (e.g., `yourhost_elajgar`).
4. Scroll down on the same page to the **MySQL Users** section. Create a new user (Username) and a strong password. Save this password somewhere safe.
5. Under the **Add User To Database** section, connect the user you just created to the database you created. On the next page, check the box for **ALL PRIVILEGES** and save changes.

---

## Step 6: Setup Node.js App in cPanel
1. On the main cPanel page, scroll down to the **Software** section and click on **Setup Node.js App**.
2. Click the **CREATE APPLICATION** button.
3. Fill in the settings as follows:
   - **Node.js version:** Select version 18 or higher.
   - **Application mode:** Set this to `Production`.
   - **Application root:** The folder name where you want your project files to live (e.g., `elajgar_app`).
   - **Application URL:** Choose the domain or subdomain where you want the site to load.
   - **Application startup file:** Type `server.js`.
4. Scroll down slightly to the **Environment variables** section and click **ADD VARIABLE**. Add the following three variables:
   - Name: `NODE_ENV` / Value: `production`
   - Name: `JWT_SECRET` / Value: (Type a long, random sequence of characters)
   - Name: `DATABASE_URL` / Value: You must write the connection link for the database you created in Step 5 using this format:
     `mysql://USERNAME:PASSWORD@localhost:3306/DATABASENAME`
     *(Replace USERNAME, PASSWORD, and DATABASENAME with the details from Step 5)*
5. Click **SAVE** and then click **CREATE** at the top of the page.

---

## Step 7: Upload the Files in cPanel
1. On the main cPanel page, open the **File Manager**.
2. Navigate to the folder you set as the "Application root" in the previous step (e.g., `elajgar_app`).
3. Click the **Upload** button at the top of the page.
4. Select and upload the `upload.zip` file you created in Step 4.
5. Once the upload reaches 100%, go back to the folder, right-click on the zip file, and select **Extract** to unpack the files.

---

## Step 8: Run Final Commands in cPanel Terminal
1. Go back to the **Setup Node.js App** page in cPanel.
2. Next to your newly created app, you will see a command that looks something like this:
   `source /home/username/nodevenv/elajgar_app/18/bin/activate && cd /home/username/elajgar_app`
   Click on it to copy the text.
3. Go back to the main cPanel page, find the **Advanced** section, and click on **Terminal**.
4. In the black terminal screen that opens, paste the text you copied and hit Enter. This brings you into your project's environment.
5. Now, run the following commands one by one, waiting for each to finish before starting the next:

**Install the packages:**
```bash
npm install --production
```

**Apply database changes (only needed the first time):**
```bash
npx prisma db push
```

**Generate Prisma code:**
```bash
npx prisma generate
```

---

## Step 9: Restart and Test
1. Go back to the **Setup Node.js App** page in cPanel.
2. Find your project in the list and click the **Restart** button (the circular arrow icon).
3. Open your domain in a web browser. Your Elajgar website should now be live!

### Troubleshooting (If you encounter issues):
If the site doesn't load or you get a 503 error:
- In the File Manager, go to your project folder and look for a file named `stderr.log`. Open it to see what the exact error is.
- Double-check that you entered your environment variables (`DATABASE_URL` and `JWT_SECRET`) correctly.
- If you ever make changes to your code on your computer, you only need to zip and upload the changed files (usually just replacing the `.next` folder), extract them, and click the **Restart** button in cPanel.
