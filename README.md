# SAUKI

A simple product catalog site. Customers browse and like products, then order via WhatsApp. Only the signed-in admin can add or delete products.

## Local environment variables

Create a file named `.env` in this folder with:

```
VITE_SUPABASE_URL=https://vlsntgvfizemwroesfrl.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_VC12reGV27x8IS1i9IYPcw_H0FVRqoM
```

## Deploying to Vercel (free)

1. Push this folder to a GitHub repository.
2. Go to vercel.com, sign in with GitHub, click "Add New Project", and import the repository.
3. In the project's Environment Variables settings, add the two variables above (same names and values).
4. Deploy. Vercel will give you a free link like `sauki.vercel.app`.

## Routes

- `/` — public storefront, no login required
- `/admin` — admin sign-in
- `/admin/dashboard` — add/delete products (requires sign-in)

## Notes

- Product photos are stored as embedded images directly in the database. This is simple and works well for a small catalog; if you later have hundreds of products with many photos each, consider moving to Supabase Storage for the images instead.
- The WhatsApp number is set in `src/lib/helpers.js` (`WHATSAPP_NUMBER`). Update it there if it ever changes.
