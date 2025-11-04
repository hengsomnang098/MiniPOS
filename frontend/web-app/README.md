# MiniPOS Web App

This is a [Next.js](https://nextjs.org) project for MiniPOS.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## POS (Order products)

- Navigate to Dashboard > POS (requires Orders.View permission)
- Select a shop first (you'll be prompted on first login). The active shop is stored in an http-only cookie.
- Search and add products to the cart, adjust quantities and discount, then click Checkout.
- Orders are submitted to the backend API: `POST /api/Order`.

If the POS menu isn't visible, ask an admin to grant you Orders.View and Orders.Create permissions.

## Environment

Set NEXT_PUBLIC_API_URL and NEXTAUTH_SECRET in `.env.local`.

