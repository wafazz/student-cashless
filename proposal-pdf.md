---
pdf_options:
  format: A4
  margin: 25mm 20mm
  printBackground: true
  displayHeaderFooter: true
  headerTemplate: '<div style="width:100%;text-align:right;font-size:8px;color:#999;padding-right:20mm;">e-Kantin — Proposal Perniagaan</div>'
  footerTemplate: '<div style="width:100%;text-align:center;font-size:8px;color:#999;">Muka Surat <span class="pageNumber"></span> / <span class="totalPages"></span></div>'
stylesheet: https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown.min.css
body_class: markdown-body
css: |-
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a1a2e; }
  .markdown-body { font-size: 11px; }
  h1 { color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px; font-size: 28px; }
  h2 { color: #1e40af; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-top: 30px; font-size: 18px; }
  h3 { color: #374151; font-size: 14px; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 10.5px; }
  th { background: #2563eb; color: white; padding: 8px 12px; text-align: left; font-weight: 600; }
  td { padding: 7px 12px; border-bottom: 1px solid #e5e7eb; }
  tr:nth-child(even) td { background: #f8fafc; }
  code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 10px; }
  pre { background: #1e293b; color: #e2e8f0; padding: 16px; border-radius: 8px; font-size: 10px; overflow-x: auto; }
  blockquote { border-left: 4px solid #2563eb; background: #eff6ff; padding: 12px 16px; margin: 12px 0; }
  .cover-page { text-align: center; padding: 100px 0 60px 0; page-break-after: always; }
  .cover-page h1 { font-size: 42px; border: none; margin-bottom: 5px; }
  .cover-page .subtitle { font-size: 18px; color: #64748b; margin-bottom: 40px; }
  .cover-page .tagline { font-size: 14px; color: #2563eb; font-weight: 600; letter-spacing: 1px; margin-top: 40px; }
  .highlight-box { background: linear-gradient(135deg, #2563eb, #1e40af); color: white; padding: 20px; border-radius: 12px; margin: 16px 0; }
  .highlight-box h3 { color: white; margin-top: 0; }
  hr { border: none; border-top: 1px solid #e5e7eb; margin: 20px 0; }
---

<div class="cover-page">

# e-Kantin

<div class="subtitle">Sistem Pembayaran Tanpa Tunai Kantin Sekolah</div>

**Proposal Perniagaan & Pelaburan**

---

Disediakan untuk:
**Pihak Pentadbiran Sekolah & Pelabur**

---

Mac 2026 | Versi 1.0

<div class="tagline">NO CASH, NO WORRY. JUST SCAN & PAY.</div>

</div>

## 1. Ringkasan Eksekutif

**e-Kantin** adalah platform pembayaran tanpa tunai (cashless) untuk kantin sekolah di Malaysia. Sistem ini menggantikan penggunaan wang tunai di kantin sekolah dengan dompet digital yang selamat, telus dan mudah digunakan.

| Komponen | Cara Berfungsi |
|----------|---------------|
| **Ibu Bapa** | Tambah nilai dompet anak melalui FPX (perbankan dalam talian) |
| **Pelajar** | Tunjuk kad QR di kantin — tanpa wang tunai, tanpa telefon |
| **Pengusaha Kantin** | Imbas QR → masukkan amaun → siap dalam 2 saat |
| **Pentadbir** | Pantau semua transaksi & laporan secara masa nyata |

> **Status:** Sistem telah siap sepenuhnya dan sedia untuk pelancaran komersial.

---

## 2. Masalah Yang Diselesaikan

### 2.1 Masalah Ibu Bapa

| Masalah | Kesan |
|---------|-------|
| Wang saku hilang/dicuri | Anak tidak dapat makan di sekolah |
| Tidak tahu anak makan apa | Risiko kesihatan, tiada kawalan pemakanan |
| Tiada kawalan perbelanjaan | Anak berbelanja berlebihan |
| Sukar memberi wang yang tepat setiap hari | Membuang masa setiap pagi |

### 2.2 Masalah Pengusaha Kantin

| Masalah | Kesan |
|---------|-------|
| Mengendalikan wang tunai yang banyak | Risiko kecurian, kesilapan pengiraan |
| Beratur panjang semasa rehat | Pelajar tidak sempat makan |
| Tiada rekod jualan yang sistematik | Sukar mengurus inventori & keuntungan |

### 2.3 Masalah Sekolah

| Masalah | Kesan |
|---------|-------|
| Sukar memantau aktiviti kantin | Isu keselamatan & kebajikan pelajar |
| Tiada data transaksi | Tidak dapat buat keputusan berdasarkan data |
| Aduan ibu bapa tentang wang hilang | Beban pentadbiran yang tidak perlu |

---

## 3. Penyelesaian: Bagaimana e-Kantin Berfungsi

### Aliran Utama

```
  IBU BAPA                    PELAJAR                   KANTIN
     │                           │                         │
     │  1. Top up dompet         │                         │
     │     via FPX/online        │                         │
     │  ───────────────────►     │                         │
     │                           │  2. Tunjuk kad QR       │
     │                           │  ──────────────────►    │
     │                           │                         │
     │                           │  3. Imbas & bayar       │
     │                           │  ◄──────────────────    │
     │                           │                         │
     │  4. Notifikasi pembelian  │                         │
     │  ◄────────────────────────┘                         │
     │                                                     │
     │  5. Pantau perbelanjaan & baki                      │
     │     melalui dashboard                               │
```

### Ciri-Ciri Utama

| Ciri | Penerangan |
|------|-----------|
| Dompet Digital | Setiap pelajar ada dompet digital dengan kod QR unik |
| Top Up FPX | Tambah nilai melalui perbankan dalam talian (Bayarcash/ToyyibPay) |
| Imbas & Bayar | Imbas QR, masukkan amaun — siap dalam 2 saat |
| Had Harian | Ibu bapa tetapkan had perbelanjaan harian anak |
| Notifikasi Real-Time | Amaran baki rendah, ringkasan perbelanjaan harian |
| Laporan & Dashboard | Jualan, transaksi, perbelanjaan — semua dalam satu tempat |
| Resit Digital | Muat turun resit PDF untuk setiap transaksi |
| PWA | Berfungsi pada semua peranti — tiada perlu install app |
| Pengurusan Kakitangan | Pengusaha kantin boleh daftar juruwang sendiri |
| Multi-Sekolah | Satu platform untuk banyak sekolah & kantin |

---

## 4. Saiz Pasaran

### 4.1 Pasaran Malaysia

| Metrik | Angka |
|--------|-------|
| Jumlah sekolah rendah kerajaan | ~7,778 |
| Jumlah sekolah menengah kerajaan | ~2,452 |
| **Jumlah sekolah kerajaan** | **~10,230** |
| Jumlah pelajar (rendah + menengah) | ~5.8 juta |
| Purata perbelanjaan kantin/pelajar/hari | RM 3 – RM 5 |

### 4.2 Peluang Pasaran

| Metrik | Pengiraan | Nilai |
|--------|-----------|-------|
| **TAM** (Total Addressable Market) | 5.8M pelajar × RM4 × 200 hari | **RM 4.64 bilion/tahun** |
| **SAM** (5% penetrasi) | 290K pelajar × RM4 × 200 hari | **RM 232 juta/tahun** |
| **SOM** (Tahun 3) | 50K pelajar × RM4 × 200 hari | **RM 40 juta/tahun** |

> Pasaran pembayaran digital Malaysia dijangka mencapai **USD 494.9 bilion** menjelang 2031, dengan pertumbuhan tahunan 11.15%. *(Sumber: GlobeNewsWire, 2026)*

---

## 5. Model Perniagaan & Pendapatan

### 5.1 Sumber Pendapatan

#### A. Yuran Langganan Sekolah (Pendapatan Berulang)

| Pakej | Jumlah Pelajar | Harga/Bulan |
|-------|---------------|-------------|
| Starter | < 300 pelajar | RM 200 |
| Standard | 300 – 700 pelajar | RM 400 |
| Premium | 700+ pelajar | RM 600 |

*Percubaan 30 hari percuma untuk semua sekolah baharu.*

#### B. Yuran Perkhidmatan Top Up (Per Transaksi)

| Komponen | Amaun |
|----------|-------|
| Caj gateway pembayaran | RM 1.00 |
| **Yuran perkhidmatan e-Kantin** | **RM 0.50** |
| Jumlah caj kepada ibu bapa | RM 1.50/transaksi |

> **Insentif:** Top up RM 50 ke atas — yuran RM 0.50 **diwaive** (menggalakkan top up lebih besar, kurang transaksi).

### 5.2 Unjuran Pendapatan (3 Tahun)

| | Tahun 1 | Tahun 2 | Tahun 3 |
|---|---------|---------|---------|
| **Sekolah aktif** | 20 | 80 | 200 |
| **Pelajar aktif** | 6,000 | 24,000 | 60,000 |
| Pendapatan langganan | RM 96,000 | RM 384,000 | RM 960,000 |
| Pendapatan yuran top up | RM 30,000 | RM 120,000 | RM 300,000 |
| **Jumlah pendapatan** | **RM 126,000** | **RM 504,000** | **RM 1,260,000** |
| Kos operasi | RM 180,000 | RM 300,000 | RM 500,000 |
| **Keuntungan bersih** | **(RM 54,000)** | **RM 204,000** | **RM 760,000** |

*Break-even dijangka pada bulan ke-15.*

---

## 6. Kelebihan Kompetitif

| Aspek | e-Kantin | Pesaing Sedia Ada |
|-------|----------|-------------------|
| Kos permulaan sekolah | **RM 0** (tiada hardware khas) | RM 5,000 – RM 20,000 |
| Perkakasan diperlukan | Telefon pintar sahaja | Terminal POS, kad khas |
| Masa pemasangan | **< 1 hari** | 1 – 4 minggu |
| Yuran bulanan | RM 200 – RM 600 | RM 500 – RM 2,000 |
| PWA (tanpa install) | ✅ Ya | ❌ Perlu app |
| Multi-gateway FPX | ✅ Bayarcash + ToyyibPay | 1 gateway sahaja |
| Had perbelanjaan harian | ✅ Ya | ❌ Jarang |
| Notifikasi real-time | ✅ Ya | ⚠️ Terhad |
| Pengurusan kakitangan kantin | ✅ Ya | ❌ Tiada |

---

## 7. Pelan Pelaksanaan

### Fasa 1: Pelancaran Pilot (Bulan 1–3)
- Pilot dengan 3–5 sekolah di Selangor/KL
- Onboarding pengusaha kantin & ibu bapa
- Kumpul maklum balas & optimumkan sistem
- **Sasaran: 1,000 pelajar aktif**

### Fasa 2: Pengembangan Serantau (Bulan 4–8)
- Kembang ke 20 sekolah
- Bina pasukan sokongan pelanggan
- Jalin kerjasama dengan PPD/JPN
- **Sasaran: 6,000 pelajar aktif**

### Fasa 3: Skala Nasional (Bulan 9–18)
- 80+ sekolah di beberapa negeri
- Perkongsian strategik dengan koperasi sekolah
- Integrasi dengan DuitNow QR
- **Sasaran: 24,000 pelajar aktif**

### Fasa 4: Pasaran Penuh (Bulan 18–36)
- 200+ sekolah seluruh Malaysia
- Ciri tambahan: pra-tempah makanan, analitik pemakanan
- Kembang ke sekolah swasta & antarabangsa
- **Sasaran: 60,000+ pelajar aktif**

---

## 8. Keperluan Pelaburan

### 8.1 Penggunaan Dana: RM 200,000

| Komponen | Amaun (RM) | % |
|----------|-----------|---|
| Pembangunan & infrastruktur teknologi | 50,000 | 25% |
| Pemasaran & jualan (roadshow sekolah) | 60,000 | 30% |
| Operasi & sokongan pelanggan (12 bulan) | 40,000 | 20% |
| Kos server & gateway pembayaran | 20,000 | 10% |
| Perkakasan demo & bahan pemasaran | 15,000 | 7.5% |
| Rizab & lain-lain | 15,000 | 7.5% |

### 8.2 Pulangan Pelaburan (ROI)

| Metrik | Tahun 1 | Tahun 2 | Tahun 3 |
|--------|---------|---------|---------|
| Pendapatan | RM 126,000 | RM 504,000 | RM 1,260,000 |
| Keuntungan bersih | (RM 54,000) | RM 204,000 | RM 760,000 |
| **ROI kumulatif** | -27% | +75% | **+305%** |

---

## 9. Manfaat Kepada Pihak Berkepentingan

### Untuk Sekolah
- ✅ Kantin tanpa tunai — lebih selamat, lebih teratur
- ✅ Dashboard & laporan masa nyata
- ✅ Kurangkan aduan ibu bapa tentang wang hilang
- ✅ Sokongan inisiatif digitalisasi KPM
- ✅ Percubaan 30 hari percuma

### Untuk Ibu Bapa
- ✅ Pantau perbelanjaan anak secara real-time
- ✅ Tetapkan had harian — kawal perbelanjaan
- ✅ Top up dari mana sahaja melalui FPX
- ✅ Notifikasi baki rendah & setiap pembelian
- ✅ Tiada risiko wang hilang/dicuri

### Untuk Pengusaha Kantin
- ✅ Tiada perlu kendalikan wang tunai
- ✅ Urus menu & kakitangan secara digital
- ✅ Rekod jualan automatik & tepat
- ✅ Kurangkan masa beratur
- ✅ Sistem refund yang terkawal

### Untuk Pelabur
- ✅ Pasaran besar — 10,000+ sekolah, 5.8 juta pelajar
- ✅ Pendapatan berulang (subscription + transaction fee)
- ✅ Kos operasi rendah (SaaS, tiada hardware)
- ✅ Sokongan dasar kerajaan ke arah cashless
- ✅ Skalabiliti nasional dengan satu platform

---

## 10. Keselamatan & Pematuhan

| Aspek | Penerangan |
|-------|-----------|
| **PDPA** | Data peribadi dilindungi mengikut Akta Perlindungan Data Peribadi 2010 |
| **PCI-DSS** | Pembayaran FPX melalui gateway berlesen BNM yang mematuhi PCI-DSS |
| **Tiada data kad** | Sistem tidak menyimpan maklumat kad bank pengguna |
| **QR selamat** | Kod QR menggunakan UUID rawak — bukan data peribadi |
| **Audit trail** | Setiap transaksi direkod dengan baki sebelum & selepas |
| **Enkripsi** | HTTPS, CSRF protection, kata laluan di-hash |

---

## 11. Soalan Lazim (FAQ)

**S: Adakah pelajar perlu telefon pintar?**
T: Tidak. Pelajar hanya perlu kad/lanyard dengan kod QR yang dicetak.

**S: Bagaimana jika internet di sekolah terputus?**
T: Sistem memerlukan internet asas. 4G pada telefon pengusaha kantin sudah mencukupi.

**S: Berapa lama masa untuk setup?**
T: Kurang dari 1 hari. Daftar sekolah → tambah pengusaha kantin → ibu bapa boleh mula.

**S: Adakah wang ibu bapa selamat?**
T: Ya. Wang top up terus masuk ke dompet pelajar. Pembayaran FPX melalui gateway berlesen BNM.

**S: Bolehkah mendapatkan refund?**
T: Ya. Pengusaha kantin boleh membuat refund untuk transaksi hari yang sama.

**S: Apakah kos untuk sekolah mencuba?**
T: Percuma untuk 30 hari pertama. Tiada komitmen, tiada kos perkakasan.

---

## 12. Hubungi Kami

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

**Disediakan oleh:** [Nama Anda] | **Tarikh:** Mac 2026 | **Versi:** 1.0
