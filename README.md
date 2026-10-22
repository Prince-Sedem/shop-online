# Marketday — Simple E-commerce (Phase 1)

A React + Vite + Tailwind CSS + Supabase starter for a small online shop. Includes a storefront, public product catalogue, protected admin dashboard, product CRUD, image uploads, and WhatsApp click-to-chat ordering. There is no online payment processing in Phase 1.

## Included

- Responsive storefront homepage and shop page
- Search, category filters, and price sorting
- Product details page
- WhatsApp order links with pre-filled product name, price, and product URL
- Supabase email/password admin login
- Admin dashboard overview
- Add, edit, and delete products
- Public product image storage with admin-only uploads
- SQL schema with Row Level Security policies
- Demo product data so the storefront can be previewed before Supabase setup

## Requirements

- Node.js supported by the installed Vite version (Node 20.19+ or 22.12+ recommended)
- npm
- A Supabase project
- A WhatsApp number for receiving orders

## 1. Install and run

```bash
npm install
cp .env.example .env
npm run dev
```

On Windows PowerShell, if `cp` is unavailable, use:

```powershell
Copy-Item .env.example .env
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

The storefront runs with sample products before Supabase is configured. Admin management and real product data require Supabase setup.

## 2. Configure Supabase

1. Create a project in Supabase.
2. Open **Project Settings → API** (or API Keys) and copy the project URL and publishable key (legacy projects may show an anon key).
3. Put them in `.env`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
VITE_WHATSAPP_NUMBER=233XXXXXXXXX
```

Use the WhatsApp number in international digits only: country code + number, no `+`, spaces, or leading local zero. Example format for a Ghana number: `233XXXXXXXXX`.

Restart the Vite server after changing `.env`.

**Never put a Supabase service-role key in a `VITE_` environment variable.** Anything with the `VITE_` prefix is included in browser code. Use only the publishable/anon key in the frontend.

## 3. Create database and storage

1. In Supabase, open **SQL Editor**.
2. Run the complete `supabase/schema.sql` script.
3. Go to **Authentication → Users** and create the administrator user with email and password. Turn off public signups if the project will only have an admin.
4. Copy the user's UUID from the Auth user record.
5. In SQL Editor, run this, replacing the placeholder with the real UUID:

```sql
insert into public.store_admins (user_id)
values ('YOUR-AUTH-USER-UUID');
```

The `store_admins` allowlist is important: an authenticated user is not automatically an admin. Only user IDs in that table can insert, update, or delete products or upload images.

If you run the schema again, it will recreate policies and functions safely, but the admin allowlist record remains.

## 4. Add your first product

1. Run the app and visit `/admin/login`.
2. Sign in using the admin user created in Supabase.
3. Choose **Add product**.
4. Fill in name, price, category, description, image, and stock/featured settings.
5. Save. The product should appear in the public shop.

Uploaded images are stored in the public `product-images` bucket. Public read access is intentional so storefront visitors can see product images; only approved admins can upload, update, or delete objects.

## 5. WhatsApp ordering

Set `VITE_WHATSAPP_NUMBER` in `.env` to the business WhatsApp number in international digits only. The button opens WhatsApp with a draft containing the product name, price, and product URL. The customer must press Send in WhatsApp. This does not automatically create an order record in the website.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Storefront homepage |
| `/shop` | Product catalogue |
| `/product/:slug` | Product details |
| `/admin/login` | Admin sign-in |
| `/admin` | Admin overview |
| `/admin/products` | Product management |
| `/admin/products/new` | Add a product |
| `/admin/products/:id/edit` | Edit a product |

## Deploy to Vercel

1. Push this folder to your GitHub repository.
2. Import the repository into Vercel.
3. Add `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and `VITE_WHATSAPP_NUMBER` to Vercel Environment Variables for Production (and Preview if needed).
4. Deploy and test the storefront and `/admin/login`.
5. Add your deployed domain to Supabase Authentication URL Configuration / allowed redirect URLs as appropriate.

Vite's default build command is `npm run build`; output directory is `dist`.

## Before launch checklist

- [ ] Replace Marketday name, text, and demo images with your real brand and product images.
- [ ] Set the correct WhatsApp number.
- [ ] Run the SQL schema and add an admin UUID to `store_admins`.
- [ ] Test that an admin can add/edit/delete a product.
- [ ] Test that an ordinary authenticated user cannot mutate products.
- [ ] Test product image upload on Supabase.
- [ ] Test all WhatsApp links on desktop and mobile.
- [ ] Add your own privacy policy and terms if collecting personal data later.

## Phase 1 limitations

- No checkout, cart, online payments, or payment verification.
- WhatsApp conversations are not saved as orders in the database.
- No customer accounts or order tracking.
- Product variants, multiple images per product, stock quantity tracking, and review management are not included.
- The sample catalogue is a local fallback and is not editable; configure Supabase to manage your actual products.


## Recent storefront additions

- **Cart:** add products from product cards or product detail pages, change quantities, remove items, and send the cart summary to WhatsApp. The cart is saved in the visitor's browser. No online payment is processed.
- **Animations:** homepage intro motion, hover transitions, and scroll-reveal effects. Users who prefer reduced motion get a quieter experience.
- **About section:** edit the copy and image in `src/pages/Storefront.jsx`.
- **Footer contact/social links:** set these optional values in `.env` (use full profile URLs for social accounts):

```env
VITE_CONTACT_NUMBER=233XXXXXXXXX
VITE_INSTAGRAM_URL=https://instagram.com/yourhandle
VITE_TIKTOK_URL=https://www.tiktok.com/@yourhandle
VITE_FACEBOOK_URL=https://facebook.com/yourpage
```

`VITE_WHATSAPP_NUMBER` should be the WhatsApp number in international format without `+` or spaces (for example, Ghana `233...`). If `VITE_CONTACT_NUMBER` is blank, the footer uses `VITE_WHATSAPP_NUMBER` for the phone contact. Restart the Vite server after changing `.env`.
