# Student Cashless — Session Memory

## Current Phase
ALL COMPLETE + KOPERASI + CART + PER-STORE LIMITS + PIBG MODULE

## What Was Done (Session 7-8)
- Koperasi module, cart-based charging, per-store daily limits
- Rebranding to "Student Cashless" with logo
- PIBG (Parents-Teachers Association) module:
  - New `school` role with SchoolLayout (teal theme)
  - School Dashboard: students, families, fee collection progress, recent payments
  - PIBG Fee CRUD: create fee, auto-assign to unique parents per school
  - Fee Detail: parent list with paid/unpaid status, reassign new families
  - School Reports: collection summary, outstanding list
  - Parent side: see outstanding fees, pay via wallet, receipt
  - Admin side: PIBG overview across schools, School Users CRUD
  - Database: pibg_fees, pibg_fee_parents tables, school_id on users
  - Fee is per-family not per-student (unique parent per school per fee)
  - HandleInertiaRequests shares pibgOutstanding count for parent nav badge

## Session Recap
5 roles: admin, parent, operator, cashier, school.
Store types: canteen, koperasi. Per-store daily limits.
PIBG fee collection per-family via wallet payment.
Repo: github.com/wafazz/student-cashless
