# e-Kantin — Session Memory

## Current Phase
ALL COMPLETE + GENERAL WALLET + KOPERASI + CART-BASED CHARGING

## What Was Done (Session 7)
- Koperasi module — full stack (web + API + mobile)
- Cart-based charging (web + mobile):
  - Staff MUST select from registered items/products — no manual amount input
  - Multi-item cart with qty +/- controls
  - Realtime search/filter for items (by name or category)
  - Auto-calculated total from cart
  - Cart description auto-generated (e.g. "Nasi Lemak, Milo x2")
  - Charge button disabled until cart has items

## Key Architecture
- canteens.type enum: 'canteen' (default) | 'koperasi'
- Same scan/charge/cart flow works for both types
- Cart system: web uses useState cart array, mobile same pattern
- Search: instant filter on name + category
- No manual amount/description — everything derived from registered items

## Session Recap
Total: 52 API routes, 70+ web routes, 22 controllers, 37+ React pages, 10 RN screens.
Roles: admin, parent, operator, cashier. Parent has general wallet + child wallets.
Store types: canteen (kantin) and koperasi. Same operator/cashier flow for both.
All platforms (web + API + mobile) fully support koperasi + cart-based charging.
