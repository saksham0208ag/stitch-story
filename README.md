# Stitch Story

Stitch Story is a boutique tailoring experience built with Next.js. Customers can save measurements, book appointments, and request customizations, while atelier staff manage orders and lookbook content from an owner dashboard.

## Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS 4
- Postgres for production persistence
- Vercel Blob for production design image uploads

## Local Development

Install dependencies and run the app:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Without database environment variables, local development falls back to `data/stitch-story-db.json` and `public/uploads`, so the demo still works on your machine.

## Production Environment Variables

Copy `.env.example` and set the values in Vercel Project Settings:

```bash
POSTGRES_URL=
DATABASE_URL=
BLOB_READ_WRITE_TOKEN=
```

Notes:

- Set either `POSTGRES_URL` or `DATABASE_URL`. The app accepts both.
- `BLOB_READ_WRITE_TOKEN` is required if atelier users should upload new design images from the CMS.
- On Vercel, the app intentionally refuses production writes if no database URL is configured.

## Vercel Deployment

1. Push this repository to GitHub.
2. In Vercel, choose `Add New Project` and import the repo.
3. Add `POSTGRES_URL` or `DATABASE_URL` in the project environment variables.
4. Add `BLOB_READ_WRITE_TOKEN` if you want CMS image uploads in production.
5. Deploy.

The app creates its tables automatically on first connection and seeds the initial demo records if the database is empty.

## Verification

Run the checks before deploying:

```bash
npm run lint
npm run build
```

## Production Notes

- Customer and atelier data is persisted in Postgres in production.
- Uploaded design images are stored in Vercel Blob in production.
- The homepage is responsive for mobile and desktop, and the dashboard now collapses cleanly on narrow screens.
