# e-Kantin — Session Memory

## Current Phase
Phase 1 COMPLETE — Foundation scaffolded, all core pages built

## What Was Done
- Laravel 12 + Inertia + React 19 + TypeScript + Tailwind 4 scaffold
- 9 migrations (users, schools, students, canteens, menu_items, transactions, topups, settings)
- 8 models with relationships (User, School, Student, Canteen, MenuItem, Transaction, Topup, Setting)
- Auth: Login/Register with role-based redirect (admin/parent/operator)
- EnsureRole middleware
- 4 layouts: AuthLayout, ParentLayout, OperatorLayout, AdminLayout
- Parent pages: Dashboard, Children (CRUD), QR Code (view/print), Transactions (paginated)
- Operator pages: Dashboard, Scan & Charge (QR scanner + quick-select menu)
- Admin: placeholder Dashboard
- DatabaseSeeder with 2 schools, 2 operators, 2 parents, 3 students, 16 menu items, 5 transactions
- HandleInertiaRequests shares auth.user + flash messages

## Next Steps
- Phase 2: Parent top up page
- Phase 3: Operator sales report, menu management
- Phase 4: FPX payment integration (Bayarcash/ToyyibPay)
- Phase 5: Admin panel

## Session Recap
New project initialized 2026-03-17. Full Phase 1 complete in first session.
Stack: Laravel 12 + Inertia + React + TS + Tailwind 4, MySQL `ekantin` port 3307.
QR: Static UUID per student, html5-qrcode for scanning, qrcode.react for display.
Wallet: lockForUpdate() in DB transaction, daily_limit + daily_spent tracking.
