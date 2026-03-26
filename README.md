# Student Cashless

Cashless school payment system for canteens (kantin) and bookstores (koperasi). Parents top up wallets, students show QR codes, store staff scan and charge from registered items.

Built with Laravel 12, Inertia.js, React, Tailwind CSS, and React Native.

## Features

### Multi-Role System
- **Admin** — manage schools, store operators, parents, transactions, invoices, reports, settings
- **Operator** — scan & charge, menu/product management, sales, refunds, staff management
- **Cashier** — scan & charge, sales, refunds (assigned by operator)
- **Parent** — manage children, top up wallets, view transactions, QR payments, profile

### Store Types
- **Kantin** (Canteen) — food & beverages
- **Koperasi** (Bookstore) — books, stationery, school apparel

Both share the same scan-charge-cart flow. UI adapts labels, placeholders, and icons based on store type. Admin dashboard shows separate sales stats per type.

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

### Payment Gateways
- Bayarcash (FPX)
- ToyyibPay (FPX)
- Manual top-up

### Mobile App (React Native)
- Operator app: QR scan, cart charging, sales, refunds, menu/product management, staff
- Parent app: dashboard, children management, wallet (QR + topup + transfer), transactions, profile
- Full koperasi + cart + per-store limits support
- Camera-based QR scanning with react-native-vision-camera

### Other
- School subscription & invoicing
- Canteen/koperasi contracts with staff (cashier/manager) management
- Service fee management with waiver thresholds
- Low balance notifications (database + email)
- PDF receipt generation (purchase + topup)
- Student photo verification during scan
- School registration (public form)
- PWA support (offline page, manifest, service worker)
- Landing page with features showcase

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

| Role | Email | Password | Store |
|------|-------|----------|-------|
| Admin | admin@ekantin.my | admin123 | — |
| Operator | kiah@ekantin.my | password | Kantin Utama (SK Taman Melawati) |
| Operator | ahmad@ekantin.my | password | Kantin Blok A (SK Wangsa Maju) |
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
  Console/Commands/     # ResetDailySpent, CheckLowBalance, GenerateInvoices
  Http/Controllers/
    Admin/              # Dashboard, Schools, Operators, Parents, Transactions,
                        # Reports, Settings, Invoices, Registrations
    Operator/           # Dashboard, Scan, Menu, Sales, Refund, Staff
    Parent/             # Dashboard, Children, Topup, Wallet, Transactions,
                        # Notifications, Profile
    Api/                # OperatorApiController, ParentApiController
    Payment/            # Bayarcash & ToyyibPay callbacks
  Models/               # User, Student, School, Canteen, MenuItem, Transaction,
                        # Topup, CanteenStaff, Invoice, SchoolRegistration
  Services/             # BayarcashService, ToyyibPayService, ReceiptService
  Notifications/        # LowBalance, TopupSuccess, DailySpending, SubscriptionExpiry

resources/js/
  layouts/              # AdminLayout, OperatorLayout, ParentLayout, AuthLayout
  pages/
    admin/              # Dashboard, Schools, Operators, Parents, Transactions,
                        # Reports, Settings, Invoices, Registrations
    operator/           # Dashboard, Scan, Menu, Sales, Refund, Staff
    parent/             # Dashboard, Children, Wallet, WalletTopup, WalletQr,
                        # Topup, TopupHistory, AllTransactions, Notifications, Profile
  types/models.ts       # TypeScript interfaces

routes/
  web.php               # 70+ web routes
  api.php               # 52+ API routes
```

## Scheduled Commands

```bash
# Add to crontab: * * * * * cd /path && php artisan schedule:run >> /dev/null 2>&1

php artisan students:reset-daily-spent    # Midnight — reset canteen + koperasi spent
php artisan students:check-low-balance    # 8:00 AM — notify parents of low balance
```

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
