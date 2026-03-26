# Student Cashless

Cashless school payment system for canteens (kantin), bookstores (koperasi), PIBG fees, and school fees. Parents top up wallets, students show QR codes, store staff scan and charge from registered items.

Built with Laravel 12, Inertia.js, React, Tailwind CSS, and React Native.

## Features

### Multi-Role System
- **Admin** — manage schools, operators, parents, transactions, packages, withdrawals, invoices, reports, settings
- **School** — manage classes, stores, PIBG fees, school fees, subscription, withdrawals, receipts, settings
- **Operator** — scan & charge, menu/product management, sales, refunds, staff management, withdrawals
- **Cashier** — scan & charge, sales, refunds (assigned by operator)
- **Parent** — manage children, top up wallets, pay PIBG & school fees, view transactions, QR payments

### Store Types
- **Kantin** (Canteen) — food & beverages
- **Koperasi** (Bookstore) — books, stationery, school apparel

Both share the same scan-charge-cart flow. UI adapts labels, placeholders, and icons based on store type. Schools can register and manage their own stores.

### Wallet System
- **Student wallets** — managed by parents, QR-based payments
- **Parent general wallet** — personal QR for direct purchases at any store
- **Wallet transfer** — parent wallet to child wallet (one-way)
- **lockForUpdate()** on all wallet operations for data integrity

### Per-Store Daily Spending Limits
- Parents set **separate daily limits** for each child per store type
- `daily_limit_canteen` — max spending per day at canteens
- `daily_limit_koperasi` — max spending per day at koperasi
- Each store type tracks its own spent counter independently
- Automatic midnight reset via scheduled command

### Cart-Based Charging
- Staff **must select from registered items** — no manual amount input
- Multi-item cart with quantity +/- controls
- Realtime search/filter by item name or category
- Auto-calculated totals and auto-generated descriptions
- Charge button disabled until cart has items

### PIBG (Parents-Teachers Association) Fees
- School creates PIBG fees (e.g. Yuran PIBG 2026)
- **Per-family** — one fee per parent per school (not per student)
- Auto-assigns to all unique parents with children in the school
- Reassign button for late-enrolled families
- Parents pay via wallet, receipt generated with school branding

### School Fees (Per-Student, Per-Class)
- School registers classes (e.g. "3 Bestari", "5 Cemerlang")
- Creates fees per class or all classes with different amounts
- Auto-assigns to students in the targeted class
- Parents pay per student via wallet
- Branded PDF receipts with school logo

### Class Management
- School registers classes with optional level/year
- Parents select from registered classes when adding children (dropdown)
- Falls back to free text if no classes registered

### Subscription Packages
- **Trial** — FREE, one-time only per school, auto-activates instantly
- **Monthly** — pay monthly, starts 1st of next month
- **Yearly** — pay yearly lump sum, starts 1st of next month
- School uploads payment receipt, admin approves to activate
- Trial auto-extends to end of month when upgrading (no gap)
- Renewal window: can only renew within 7 days before expiry
- Expired subscription: retroactive start from 1st of current month
- Admin manages packages (name, price, duration, features) dynamically

### Settlement & Withdrawals
- **Stores**: track earnings from sales, request withdrawal with platform fee
- **Schools**: track PIBG + school fee collections, request withdrawal
- Bank details management for both entities
- Admin approves/rejects withdrawals, marks as paid with bank reference
- Withdrawal fee % configurable from admin settings (default: 3% stores, 2% schools)

### School Receipts & Branding
- School uploads logo and sets contact info (name, address, phone, email)
- Branded PDF receipts for PIBG and school fee payments
- Includes school logo, contact info, PAID watermark, fee details

### Payment Gateways
- Bayarcash (FPX)
- ToyyibPay (FPX)
- Manual top-up / manual bank transfer (with receipt upload)

### Mobile App (React Native)
- Operator app: QR scan, cart charging, sales, refunds, menu/product management, staff
- Parent app: dashboard, children management, wallet (QR + topup + transfer), transactions, profile
- Full koperasi + cart + per-store limits support
- Camera-based QR scanning with react-native-vision-camera

### Other
- Canteen/koperasi contracts with staff (cashier/manager) management
- Service fee management with waiver thresholds
- Low balance notifications (database + email)
- PDF receipt generation (purchase + topup + fees)
- Student photo verification during scan
- School registration (public form)
- PWA support (offline page, manifest, service worker)
- Landing page with features showcase
- Standardized date format: "4th April, 2026"

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Laravel 12, PHP 8.2+ |
| Frontend | React 19, Inertia.js, Tailwind CSS 4 |
| Mobile | React Native 0.84 (separate repo) |
| Database | MySQL / MariaDB |
| Auth | Laravel Sanctum (API), session (web) |
| PDF | barryvdh/laravel-dompdf |
| Charts | react-apexcharts |
| QR (web) | html5-qrcode, qrcode.react |
| QR (mobile) | react-native-vision-camera, react-native-qrcode-svg |

## Requirements

- PHP 8.2+
- Composer
- Node.js 18+
- MySQL 8.0+ / MariaDB 10.6+

## Installation

### 1. Clone & install dependencies

```bash
git clone https://github.com/wafazz/student-cashless.git
cd student-cashless
composer install
npm install
```

### 2. Environment setup

```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env` with your database credentials:

```
APP_NAME="Student Cashless"
DB_DATABASE=ekantin
DB_USERNAME=root
DB_PASSWORD=
```

### 3. Database

```bash
php artisan migrate --seed
php artisan storage:link
```

### 4. Run

```bash
# Development
npm run dev
php artisan serve

# Production build
npm run build
```

Visit `http://localhost:8000`

## Default Credentials

| Role | Email | Password | Details |
|------|-------|----------|---------|
| Admin | admin@ekantin.my | admin123 | Platform admin |
| School | pibg@skmelawati.my | password | SK Taman Melawati |
| School | pibg@skwangsa.my | password | SK Wangsa Maju |
| Operator | kiah@ekantin.my | password | Kantin Utama |
| Operator | ahmad@ekantin.my | password | Kantin Blok A |
| Parent | siti@test.com | password | 2 children |
| Parent | abu@test.com | password | 1 child |

## API Endpoints

52+ RESTful API endpoints for mobile app integration. All protected routes use Bearer token auth (Sanctum).

### Public
```
POST /api/operator/login
POST /api/parent/login
POST /api/parent/register
```

### Operator (auth:sanctum)
```
GET  /api/operator/dashboard
GET  /api/operator/profile
POST /api/operator/lookup          # QR scan → student/parent lookup
POST /api/operator/charge          # Charge wallet (cart-based)
GET  /api/operator/sales           # Daily sales with date filter
GET  /api/operator/menu            # List items (includes store type)
POST /api/operator/menu            # Add item
PUT  /api/operator/menu/{id}       # Update item
DELETE /api/operator/menu/{id}     # Delete item
GET  /api/operator/refunds         # Refundable charges
POST /api/operator/refunds         # Process refund
GET  /api/operator/staff           # List staff
POST /api/operator/staff           # Add staff
PUT  /api/operator/staff/{id}      # Update staff
```

### Parent (auth:sanctum)
```
GET  /api/parent/dashboard
GET  /api/parent/children
POST /api/parent/children          # Add child (with per-store limits)
PUT  /api/parent/children/{id}     # Update child
GET  /api/parent/transactions      # Filter by type, store_type, date
GET  /api/parent/wallet
POST /api/parent/wallet/topup
POST /api/parent/wallet/transfer   # Wallet → child
GET  /api/parent/topup/history
GET  /api/parent/notifications
GET  /api/parent/profile
PUT  /api/parent/profile
```

See `routes/api.php` for full list.

## Project Structure

```
app/
  Console/Commands/     # ResetDailySpent, CheckLowBalance, ActivateSubscriptions,
                        # GenerateInvoices, CheckSubscriptionExpiry
  Http/Controllers/
    Admin/              # Dashboard, Schools, Operators, Parents, Transactions,
                        # Reports, Settings, Invoices, Registrations, Packages,
                        # SubscriptionPayments, Withdrawals, Pibg, SchoolUsers
    School/             # Dashboard, Classes, Stores, PibgFees, SchoolFees,
                        # Subscription, Withdrawals, Receipts, Settings, Reports
    Operator/           # Dashboard, Scan, Menu, Sales, Refund, Staff, Withdrawals
    Parent/             # Dashboard, Children, Topup, Wallet, Transactions,
                        # Notifications, Profile, PibgFees, SchoolFees
    Api/                # OperatorApiController, ParentApiController
    Payment/            # Bayarcash & ToyyibPay callbacks
  Models/               # User, Student, School, SchoolClass, Canteen, MenuItem,
                        # Transaction, Topup, CanteenStaff, Invoice, PibgFee,
                        # PibgFeeParent, SchoolFee, SchoolFeeStudent, Withdrawal,
                        # SubscriptionPackage, SubscriptionPayment, SchoolRegistration
  Services/             # BayarcashService, ToyyibPayService, ReceiptService
  Notifications/        # LowBalance, TopupSuccess, DailySpending, SubscriptionExpiry

resources/js/
  layouts/              # AdminLayout, OperatorLayout, ParentLayout, SchoolLayout, AuthLayout
  pages/
    admin/              # Dashboard, Schools, Operators, Parents, Transactions, Reports,
                        # Settings, Invoices, Registrations, Packages, SubscriptionPayments,
                        # Withdrawals, Pibg, SchoolUsers
    school/             # Dashboard, Classes, Stores, PibgFees, PibgFeeDetail, SchoolFees,
                        # SchoolFeeDetail, Subscription, Withdrawals, Reports, Settings
    operator/           # Dashboard, Scan, Menu, Sales, Refund, Staff, Withdrawals
    parent/             # Dashboard, Children, Wallet, WalletTopup, WalletQr, Topup,
                        # TopupHistory, AllTransactions, Notifications, Profile,
                        # PibgFees, SchoolFees
  types/models.ts       # TypeScript interfaces
  utils/date.ts         # Shared date formatting helpers

routes/
  web.php               # 90+ web routes
  api.php               # 52+ API routes
```

## Scheduled Commands

```bash
# Add to crontab: * * * * * cd /path && php artisan schedule:run >> /dev/null 2>&1

students:reset-daily-spent       # 00:00 — reset canteen + koperasi spent counters
subscriptions:activate           # 00:05 — flip trial → active on paid plan start date
schools:check-subscription       # 01:00 — check expiring subscriptions
students:check-low-balance       # 08:00 — notify parents of low balance
invoices:generate                # 1st of month 02:00 — generate monthly invoices
```

## Revenue Model

| Source | Type |
|--------|------|
| School subscription (Trial/Monthly/Yearly) | Recurring |
| Top-up service fee (per transaction) | Per-use |
| Store withdrawal fee (configurable %) | On withdrawal |
| School withdrawal fee (configurable %) | On withdrawal |

All fees configurable from Admin > Settings.

## Deployment (VPS)

```bash
git clone https://github.com/wafazz/student-cashless.git
cd student-cashless

composer install --no-dev --optimize-autoloader
npm install && npm run build

cp .env.example .env
# Edit .env: APP_ENV=production, APP_DEBUG=false, DB credentials, APP_URL

php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Configure Nginx/Apache to point to the `public/` directory.

For a fresh production setup without demo data:
```bash
php artisan migrate
php artisan tinker
> User::create(['name'=>'Admin','email'=>'admin@yoursite.com','password'=>'yourpass','role'=>'admin']);
```

## License

Proprietary. All rights reserved.
