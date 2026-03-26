# e-Kantin

Cashless school payment system for canteens (kantin) and bookstores (koperasi). Built with Laravel 12, Inertia.js, React, and Tailwind CSS.

## Features

### Multi-Role System
- **Admin** — manage schools, operators, parents, transactions, invoices, reports
- **Operator** — scan & charge, menu/product management, sales, refunds, staff management
- **Cashier** — scan & charge, sales, refunds (assigned by operator)
- **Parent** — manage children, top up wallets, view transactions, QR payments

### Store Types
- **Kantin** (Canteen) — food & beverages
- **Koperasi** (Bookstore) — books, stationery, school apparel

Both share the same scan-charge-cart flow. UI adapts labels, placeholders, and icons based on store type.

### Wallet System
- **Student wallets** — managed by parents, daily spending limits
- **Parent general wallet** — personal QR for direct purchases
- **Wallet transfer** — parent wallet to child wallet (one-way)

### Cart-Based Charging
- Staff must select from registered items — no manual amount input
- Multi-item cart with quantity controls
- Realtime search/filter by item name or category
- Auto-calculated totals and descriptions

### Payment Gateways
- Bayarcash (FPX)
- ToyyibPay (FPX)
- Manual top-up

### Other
- School subscription & invoicing
- Service fee management with waiver thresholds
- Low balance notifications
- PDF receipt generation
- Student photo verification during scan
- PWA support (offline page, manifest, service worker)

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

## Requirements

- PHP 8.2+
- Composer
- Node.js 18+
- MySQL 8.0+ / MariaDB 10.6+

## Installation

### 1. Clone & install dependencies

```bash
git clone <repo-url> e-kantin
cd e-kantin
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

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ekantin.my | admin123 |
| Operator | kiah@ekantin.my | password |
| Operator | ahmad@ekantin.my | password |
| Parent | siti@test.com | password |
| Parent | abu@test.com | password |

## API

52+ RESTful API endpoints for mobile app integration. All protected routes use Bearer token auth (Sanctum).

```
POST /api/operator/login
POST /api/parent/login
POST /api/parent/register
```

Authenticated routes under `/api/operator/*` and `/api/parent/*`. See `routes/api.php` for full list.

## Project Structure

```
app/
  Http/Controllers/
    Admin/          # School, operator, parent, transaction, report management
    Operator/       # Scan, menu, sales, refund, staff controllers
    Parent/         # Dashboard, children, topup, wallet, transactions
    Api/            # Mobile API controllers
    Payment/        # Bayarcash & ToyyibPay callbacks
  Models/           # User, Student, School, Canteen, MenuItem, Transaction, etc.
  Services/         # Payment gateway services, receipt generation

resources/js/
  layouts/          # AdminLayout, OperatorLayout, ParentLayout
  pages/
    admin/          # Dashboard, Schools, Operators, Transactions, Reports, etc.
    operator/       # Dashboard, Scan, Menu, Sales, Refund, Staff
    parent/         # Dashboard, Children, Wallet, Topup, Transactions, etc.
  types/            # TypeScript interfaces (models.ts)

routes/
  web.php           # 70+ web routes
  api.php           # 52+ API routes
```

## Deployment (VPS)

```bash
composer install --no-dev --optimize-autoloader
npm install && npm run build
cp .env.example .env  # configure for production
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Set `APP_ENV=production`, `APP_DEBUG=false`, and configure your web server (Nginx/Apache) to point to the `public/` directory.

## License

Proprietary. All rights reserved.
