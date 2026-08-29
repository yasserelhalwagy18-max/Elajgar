<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/e8f0ab4b-5af2-46be-ad3d-ccae83b54dd5

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy the `.env.example` file to `.env.local`:
   `cp .env.example .env.local`
3. Set `DATABASE_URL` and `JWT_SECRET` in `.env.local`.
4. Run the app:
   `npm run dev`
