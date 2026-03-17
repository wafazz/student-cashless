# e-Kantin — Cashless Canteen Payment System

> Cashless QR-based payment for school canteens. Parents top up, students show QR, canteen scans & deducts.

## Stack
Laravel 12 + Inertia.js + React 19 + TypeScript + Tailwind CSS 4 + MySQL

## Roles
1. **admin** — Platform admin (manage schools, operators, view all transactions)
2. **parent** — Top up wallet, monitor spending, set limits, generate QR for children
3. **operator** — Canteen operator (scan QR, charge meals, view daily sales)

## Database Schema

### users
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| name | varchar | |
| email | varchar unique | |
| phone | varchar nullable | |
| password | varchar | |
| role | enum(admin,parent,operator) | |
| status | enum(active,inactive) | default active |
| email_verified_at | timestamp nullable | |
| remember_token | varchar nullable | |
| timestamps | | |

### schools
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| name | varchar | |
| address | text nullable | |
| phone | varchar nullable | |
| logo | varchar nullable | |
| status | enum(active,inactive) | default active |
| timestamps | | |

### students
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| parent_id | FK users | |
| school_id | FK schools | |
| name | varchar | |
| ic_number | varchar nullable | MyKid/IC |
| class_name | varchar nullable | e.g. "3 Bestari" |
| wallet_uuid | uuid unique | For QR code — no sensitive data exposed |
| wallet_balance | decimal(10,2) | default 0.00 |
| daily_limit | decimal(10,2) nullable | null = no limit |
| daily_spent | decimal(10,2) | default 0.00, reset daily |
| photo | varchar nullable | |
| status | enum(active,inactive) | default active |
| timestamps | | |

### canteens
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| school_id | FK schools | |
| operator_id | FK users | |
| name | varchar | e.g. "Kantin Blok A" |
| status | enum(active,inactive) | default active |
| timestamps | | |

### menu_items
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| canteen_id | FK canteens | |
| name | varchar | |
| price | decimal(8,2) | |
| category | varchar nullable | e.g. "Minuman", "Nasi", "Kuih" |
| is_available | boolean | default true |
| timestamps | | |

### transactions
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| student_id | FK students | |
| canteen_id | FK canteens nullable | null for topups |
| operator_id | FK users nullable | null for topups |
| type | enum(topup,purchase,refund) | |
| amount | decimal(10,2) | always positive |
| balance_before | decimal(10,2) | |
| balance_after | decimal(10,2) | |
| description | varchar nullable | |
| reference_id | varchar nullable | topup payment ref |
| created_at | timestamp | |

### topups
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| parent_id | FK users | |
| student_id | FK students | |
| amount | decimal(10,2) | |
| payment_method | enum(fpx,manual) | |
| gateway | varchar nullable | toyyibpay/bayarcash |
| gateway_ref | varchar nullable | gateway transaction ID |
| status | enum(pending,success,failed) | |
| timestamps | | |

### settings
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| key | varchar unique | |
| value | text nullable | |
| timestamps | | |

## QR System
- Each student gets a **wallet_uuid** (UUID v4) on creation
- QR code encodes ONLY the UUID — no name, no balance, no sensitive data
- Parent can view/print QR from dashboard
- Canteen operator scans QR → system looks up student → shows name + balance → operator enters amount → confirm → deduct
- Daily limit check: if `daily_spent + amount > daily_limit` → reject
- Reset `daily_spent` to 0 via scheduled command at midnight

## Payment Flow (Top Up)
1. Parent selects child → enters amount → chooses FPX
2. System creates `topup` record (pending) → redirects to gateway
3. Gateway callback → marks topup success → credits wallet → creates transaction record
4. All in DB transaction with `lockForUpdate()` on student balance

## Phase Breakdown

### Phase 1: Foundation (Current)
- [x] Laravel scaffold + Inertia + React + TypeScript + Tailwind
- [ ] Database migrations + models + relationships
- [ ] Auth system (register/login) with role-based redirect
- [ ] Base layouts (admin, parent, operator)
- [ ] Seeder with demo data

### Phase 2: Parent Dashboard
- [ ] Dashboard (wallet balances, recent transactions)
- [ ] Add/manage children profiles
- [ ] View/print QR code for each child
- [ ] Set daily spending limit
- [ ] Transaction history with filters

### Phase 3: Canteen Operator
- [ ] QR scanner page (camera-based)
- [ ] Charge student flow (scan → verify → enter amount → confirm → deduct)
- [ ] Daily sales summary
- [ ] Menu management (optional quick-select items)

### Phase 4: Wallet Top Up
- [ ] FPX payment (Bayarcash/ToyyibPay)
- [ ] Manual bank transfer option
- [ ] Top up history
- [ ] Low balance notification

### Phase 5: Admin Panel
- [ ] Dashboard (platform stats, total transactions)
- [ ] School management (CRUD)
- [ ] Operator management (assign to school/canteen)
- [ ] Parent/student overview
- [ ] Transaction reports
- [ ] Platform settings (payment gateway config)

### Phase 6: Polish
- [ ] Notifications (low balance, daily summary for parent)
- [ ] PWA support (operator needs mobile scanner)
- [ ] Daily spending reset scheduler
- [ ] Receipt/transaction PDF
- [ ] Charts & analytics

## Routes Plan

### Auth
- GET /login, POST /login
- GET /register, POST /register
- POST /logout

### Parent (/parent/*)
- GET /parent/dashboard
- GET /parent/children (list)
- POST /parent/children (add)
- GET /parent/children/{id}/edit
- PUT /parent/children/{id}
- GET /parent/children/{id}/qr (view QR)
- GET /parent/children/{id}/transactions
- POST /parent/topup (initiate)
- GET /parent/topup/history

### Operator (/operator/*)
- GET /operator/dashboard
- GET /operator/scan (QR scanner page)
- POST /operator/charge (process payment)
- GET /operator/sales (daily summary)
- GET /operator/menu (manage items)

### Admin (/admin/*)
- GET /admin/dashboard
- CRUD /admin/schools
- CRUD /admin/operators
- GET /admin/parents (list)
- GET /admin/transactions
- GET /admin/settings

### Payment Callbacks
- POST /payment/callback/{gateway}
- GET /payment/return/{gateway}
