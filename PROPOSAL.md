# e-Kantin
## Sistem Pembayaran Tanpa Tunai Kantin Sekolah
### Proposal Perniagaan & Pelaburan

---

## 1. Ringkasan Eksekutif

**e-Kantin** adalah platform pembayaran tanpa tunai (cashless) untuk kantin sekolah di Malaysia. Sistem ini menggantikan penggunaan wang tunai di kantin sekolah dengan dompet digital yang selamat, telus dan mudah digunakan.

**Bagaimana ia berfungsi:**
- **Ibu bapa** menambah nilai (top up) dompet anak melalui perbankan dalam talian (FPX)
- **Pelajar** menggunakan kod QR untuk membayar di kantin — tanpa perlu wang tunai atau telefon pintar
- **Pengusaha kantin** mengimbas kod QR dan mengenakan bayaran secara digital
- **Pentadbir sekolah** memantau semua transaksi secara masa nyata

**Status:** Sistem telah siap sepenuhnya dan sedia untuk pelancaran komersial.

---

## 2. Masalah Yang Diselesaikan

### Masalah Ibu Bapa
| Masalah | Kesan |
|---------|-------|
| Wang saku hilang/dicuri | Anak tidak dapat makan di sekolah |
| Tidak tahu anak makan apa | Risiko kesihatan, tiada kawalan pemakanan |
| Tiada kawalan perbelanjaan | Anak berbelanja berlebihan |
| Sukar memberi wang yang tepat setiap hari | Membuang masa setiap pagi |

### Masalah Pengusaha Kantin
| Masalah | Kesan |
|---------|-------|
| Mengendalikan wang tunai yang banyak | Risiko kecurian, kesilapan pengiraan |
| Beratur panjang semasa rehat | Pelajar tidak sempat makan |
| Tiada rekod jualan yang sistematik | Sukar mengurus inventori & keuntungan |
| Wang palsu/rosak | Kerugian kewangan |

### Masalah Sekolah
| Masalah | Kesan |
|---------|-------|
| Sukar memantau aktiviti kantin | Isu keselamatan & kebajikan pelajar |
| Tiada data transaksi | Tidak dapat buat keputusan berdasarkan data |
| Aduan ibu bapa tentang wang hilang | Beban pentadbiran yang tidak perlu |

---

## 3. Penyelesaian: e-Kantin

### Aliran Sistem

```
┌──────────┐    Top Up     ┌──────────┐    Imbas QR    ┌──────────┐
│ Ibu Bapa │ ────────────► │  Dompet  │ ─────────────► │ Kantin   │
│          │   (FPX/       │  Pelajar │   Bayar tanpa  │ Operator │
│          │    Manual)    │          │   tunai        │          │
└──────────┘               └──────────┘                └──────────┘
     │                          │                           │
     │ ◄─── Notifikasi ────────┘                           │
     │      (baki rendah,                                  │
     │       pembelian)                                    │
     │                                                     │
     │                    ┌──────────┐                     │
     └───── Laporan ────► │  Admin   │ ◄── Laporan ───────┘
                          │  Sekolah │     Jualan
                          └──────────┘
```

### Ciri-Ciri Utama

| Ciri | Penerangan |
|------|-----------|
| **Dompet Digital** | Setiap pelajar mempunyai dompet digital dengan kod QR unik |
| **Top Up FPX** | Ibu bapa tambah nilai melalui perbankan dalam talian (Bayarcash/ToyyibPay) |
| **Imbas & Bayar** | Pengusaha kantin imbas QR, masukkan amaun — siap dalam 2 saat |
| **Had Harian** | Ibu bapa tetapkan had perbelanjaan harian anak |
| **Notifikasi** | Amaran baki rendah, ringkasan perbelanjaan harian |
| **Laporan Masa Nyata** | Jualan, transaksi, perbelanjaan — semua dalam dashboard |
| **Resit Digital** | Muat turun resit PDF untuk setiap transaksi |
| **PWA** | Berfungsi pada semua peranti — tiada perlu muat turun aplikasi |
| **Pengurusan Kakitangan** | Pengusaha kantin boleh mendaftar juruwang sendiri |
| **Multi-Sekolah** | Satu platform untuk banyak sekolah & kantin |

---

## 4. Saiz Pasaran (Market Opportunity)

### Pasaran Malaysia

| Metrik | Angka |
|--------|-------|
| Jumlah sekolah rendah kerajaan | ~7,778 |
| Jumlah sekolah menengah kerajaan | ~2,452 |
| **Jumlah sekolah kerajaan** | **~10,230** |
| Jumlah pelajar (rendah + menengah) | ~5.8 juta |
| Purata perbelanjaan kantin/pelajar/hari | RM 3 – RM 5 |
| Jumlah transaksi kantin/hari (anggaran) | ~17 juta |

### Total Addressable Market (TAM)

```
5,800,000 pelajar × RM 4.00/hari × 200 hari persekolahan = RM 4.64 bilion/tahun
```

### Serviceable Addressable Market (SAM) — 5% penetrasi

```
290,000 pelajar × RM 4.00/hari × 200 hari = RM 232 juta/tahun
```

### Pasaran pembayaran digital Malaysia dijangka mencapai **USD 494.9 bilion** menjelang 2031, dengan CAGR 11.15%.

---

## 5. Model Perniagaan & Pendapatan

### Sumber Pendapatan

#### A. Yuran Langganan Sekolah (B2B)

| Pakej | Pelajar | Harga/Bulan |
|-------|---------|-------------|
| Starter | < 300 | RM 200 |
| Standard | 300 – 700 | RM 400 |
| Premium | 700+ | RM 600 |

*Harga boleh disesuaikan mengikut sekolah — pricing dinamik dalam sistem.*

#### B. Yuran Perkhidmatan Top Up (B2C)

| Komponen | Amaun |
|----------|-------|
| Caj gateway (Bayarcash/ToyyibPay) | RM 1.00/transaksi |
| **Yuran perkhidmatan e-Kantin** | **RM 0.50/transaksi** |
| Jumlah caj kepada ibu bapa | RM 1.50/transaksi |

*Ibu bapa yang top up RM 50 ke atas — yuran RM 0.50 diwaive (menggalakkan top up lebih besar).*

### Unjuran Pendapatan

#### Tahun 1: 20 Sekolah

| Sumber | Pengiraan | Bulanan | Tahunan |
|--------|-----------|---------|---------|
| Langganan | 20 × RM 400 | RM 8,000 | RM 96,000 |
| Yuran top up | 5,000 top up × RM 0.50 | RM 2,500 | RM 30,000 |
| **Jumlah** | | **RM 10,500** | **RM 126,000** |

#### Tahun 2: 80 Sekolah

| Sumber | Pengiraan | Bulanan | Tahunan |
|--------|-----------|---------|---------|
| Langganan | 80 × RM 400 | RM 32,000 | RM 384,000 |
| Yuran top up | 20,000 top up × RM 0.50 | RM 10,000 | RM 120,000 |
| **Jumlah** | | **RM 42,000** | **RM 504,000** |

#### Tahun 3: 200 Sekolah

| Sumber | Pengiraan | Bulanan | Tahunan |
|--------|-----------|---------|---------|
| Langganan | 200 × RM 400 | RM 80,000 | RM 960,000 |
| Yuran top up | 50,000 top up × RM 0.50 | RM 25,000 | RM 300,000 |
| **Jumlah** | | **RM 105,000** | **RM 1,260,000** |

---

## 6. Kelebihan Kompetitif

| Kelebihan | e-Kantin | Pesaing Sedia Ada |
|-----------|----------|-------------------|
| Kos permulaan sekolah | RM 0 (tiada hardware khas) | RM 5,000 – RM 20,000 (terminal/kad) |
| Perkakasan diperlukan | Telefon pintar sahaja | Terminal POS, kad pelajar khas |
| Masa pemasangan | 1 hari | 1 – 4 minggu |
| Yuran bulanan | RM 200 – RM 600 | RM 500 – RM 2,000 |
| PWA (tiada install) | Ya | Tidak (kebanyakan perlu app) |
| Pengurusan kakitangan | Ya (owner + cashier) | Terhad |
| Multi-gateway FPX | Bayarcash + ToyyibPay | Biasanya 1 sahaja |
| Had perbelanjaan harian | Ya | Jarang |
| Notifikasi ibu bapa | Ya (real-time) | Terhad |

---

## 7. Pelan Pelaksanaan

### Fasa 1: Pelancaran (Bulan 1–3)
- Pilot dengan 3–5 sekolah di Selangor/KL
- Onboarding pengusaha kantin & ibu bapa
- Kumpul maklum balas & optimumkan sistem
- Sasaran: 1,000 pelajar aktif

### Fasa 2: Pengembangan Serantau (Bulan 4–8)
- Kembang ke 20 sekolah
- Tambah ciri berdasarkan maklum balas
- Bina pasukan sokongan pelanggan
- Jalin kerjasama dengan PPD/JPN

### Fasa 3: Skala Nasional (Bulan 9–18)
- Kembang ke 80+ sekolah di beberapa negeri
- Perkongsian strategik dengan koperasi sekolah
- Integrasi dengan sistem pembayaran tambahan (DuitNow QR)
- Sasaran: 50,000 pelajar aktif

### Fasa 4: Pasaran Penuh (Bulan 18–36)
- 200+ sekolah seluruh Malaysia
- Ciri tambahan: pra-tempah makanan, analitik pemakanan
- Potensi kembang ke sekolah swasta & antarabangsa
- Sasaran: 100,000+ pelajar aktif

---

## 8. Keperluan Pelaburan

### Penggunaan Dana

| Komponen | Amaun (RM) | % |
|----------|-----------|---|
| Pembangunan & infrastruktur teknologi | 50,000 | 25% |
| Pemasaran & jualan (roadshow sekolah) | 60,000 | 30% |
| Operasi & sokongan pelanggan (12 bulan) | 40,000 | 20% |
| Kos server & gateway pembayaran | 20,000 | 10% |
| Perkakasan demo & bahan pemasaran | 15,000 | 7.5% |
| Rizab & lain-lain | 15,000 | 7.5% |
| **Jumlah** | **RM 200,000** | **100%** |

### Pulangan Pelaburan (ROI)

| Metrik | Tahun 1 | Tahun 2 | Tahun 3 |
|--------|---------|---------|---------|
| Sekolah aktif | 20 | 80 | 200 |
| Pendapatan tahunan | RM 126,000 | RM 504,000 | RM 1,260,000 |
| Kos operasi | RM 180,000 | RM 300,000 | RM 500,000 |
| **Keuntungan bersih** | **(RM 54,000)** | **RM 204,000** | **RM 760,000** |
| ROI kumulatif | -27% | +75% | **+305%** |

*Break-even dijangka pada bulan ke-15.*

---

## 9. Pasukan

| Peranan | Tanggungjawab |
|---------|--------------|
| **Pengasas / CEO** | Strategi perniagaan, hubungan sekolah & pelabur |
| **CTO / Pembangun** | Pembangunan sistem, infrastruktur teknologi |
| **Pegawai Jualan** | Onboarding sekolah, demo produk, roadshow |
| **Sokongan Pelanggan** | Bantuan teknikal, latihan pengguna |

---

## 10. Manfaat Kepada Pihak Berkepentingan

### Untuk Sekolah
- Kantin tanpa tunai — lebih selamat, lebih teratur
- Dashboard & laporan masa nyata
- Kurangkan aduan ibu bapa tentang wang hilang
- Sokongan inisiatif digitalisasi KPM
- Percubaan 30 hari percuma

### Untuk Ibu Bapa
- Pantau perbelanjaan anak secara masa nyata
- Tetapkan had harian — kawal perbelanjaan
- Top up dari mana sahaja melalui FPX
- Notifikasi baki rendah & pembelian
- Tiada risiko wang hilang/dicuri

### Untuk Pengusaha Kantin
- Tiada perlu mengendalikan wang tunai
- Urus menu & kakitangan secara digital
- Rekod jualan automatik & tepat
- Kurangkan masa beratur
- Sistem refund yang terkawal

### Untuk Pelabur
- Pasaran besar (10,000+ sekolah, 5.8 juta pelajar)
- Model pendapatan berulang (subscription + transaction fee)
- Kos operasi rendah (SaaS, tiada hardware)
- Sokongan dasar kerajaan ke arah cashless
- Skala nasional dengan satu platform

---

## 11. Teknologi

| Komponen | Teknologi |
|----------|-----------|
| Backend | Laravel 12 (PHP) |
| Frontend | React + Inertia.js |
| Database | MySQL |
| Pembayaran | FPX (Bayarcash, ToyyibPay) |
| QR Code | UUID-based, tiada data sensitif |
| Hosting | Cloud-based (auto-scale) |
| Keselamatan | HTTPS, CSRF protection, hashed passwords, row-level locking |
| Mobile | PWA — berfungsi pada semua peranti tanpa install |

---

## 12. Pematuhan & Keselamatan

- **PDPA** — Data peribadi pelajar & ibu bapa dilindungi mengikut Akta Perlindungan Data Peribadi 2010
- **PCI-DSS** — Pembayaran FPX melalui gateway yang mematuhi piawaian PCI-DSS
- **Tiada data kad** — Sistem tidak menyimpan maklumat kad bank pengguna
- **QR selamat** — Kod QR menggunakan UUID rawak, bukan data peribadi
- **Audit trail** — Setiap transaksi direkod dengan baki sebelum & selepas

---

## 13. Soalan Lazim (FAQ)

**S: Adakah pelajar perlu telefon pintar?**
T: Tidak. Pelajar hanya perlu kad/lanyard dengan kod QR yang dicetak. Tiada telefon diperlukan.

**S: Bagaimana jika internet di sekolah terputus?**
T: Sistem memerlukan internet untuk beroperasi. Kami menyarankan sekolah mempunyai sambungan internet asas (4G pun mencukupi untuk pengusaha kantin).

**S: Berapa lama masa untuk setup?**
T: Kurang dari 1 hari. Daftar sekolah, tambah pengusaha kantin, dan ibu bapa boleh mula mendaftar serta-merta.

**S: Adakah wang ibu bapa selamat?**
T: Ya. Wang top up terus masuk ke dompet pelajar. Pembayaran FPX melalui gateway berlesen BNM.

**S: Bolehkah ibu bapa mendapatkan refund?**
T: Ya. Pengusaha kantin boleh membuat refund untuk transaksi hari yang sama.

---

## 14. Hubungi Kami

| | |
|---|---|
| **Syarikat** | [Nama Syarikat Anda] |
| **Alamat** | [Alamat Pejabat] |
| **Email** | [email@domain.com] |
| **Telefon** | [No. Telefon] |
| **Laman Web** | [URL] |

---

*Dokumen ini adalah sulit dan ditujukan hanya untuk pihak yang berkenaan.*
*e-Kantin — No Cash, No Worry. Just Scan & Pay.*

---

**Disediakan oleh:** [Nama Anda]
**Tarikh:** Mac 2026
**Versi:** 1.0
