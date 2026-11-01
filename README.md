# SkyTerra Financial & Cash Flow Portal

Web portal manajemen arus kas, laporan keuangan, dan inventarisasi sparepart alat survei untuk PT SkyTerra Nusantara.

---

## Fitur Utama

- **Dashboard Overview (Bench Overview)**  
  Ringkasan arus kas real-time, grafik tren pemasukan/pengeluaran, dan metrik saldo keuangan perusahaan.

- **Manajemen Arus Kas (Cash Flow)**  
  Pencatatan transaksi kas harian (pemasukan & pengeluaran) baik secara satuan (*single input*) maupun unggah massal (*bulk upload* file Excel/CSV).

- **Inventarisasi Sparepart**  
  Pengelolaan stok suku cadang alat survei dan pemetaan geospasial, pencatatan stok masuk/keluar, serta notifikasi stok menipis.

- **Kalkulasi Pajak & Selisih Saldo**  
  Perhitungan otomatis estimasi beban pajak (PPh/PPN) dan analisis selisih pencatatan saldo kas.

- **Role-Based Access Control (RBAC)**  
  Pembatasan hak akses berbasis peran (Super Admin, Manajer Divisi, dan Viewer) dengan isolasi data antar-divisi.

- **Ekspor Laporan PDF & Audit Log**  
  Unduh laporan keuangan siap cetak (bulanan, kuartalan, tahunan) berformat PDF dan pelacakan riwayat aktivitas perubahan data.

---

## Login & Hak Akses

Semua halaman `/dashboard` dilindungi login. Sesi disimpan di cookie `httpOnly` yang ditandatangani HMAC (berlaku 8 jam).

Akun demo (data simulasi di `src/lib/auth.ts`):

| Peran | Email | Kata sandi |
|---|---|---|
| Super Admin | admin@skyterra.co.id | Admin#2026 |
| Manajer Divisi | manajer@skyterra.co.id | Manajer#2026 |
| Viewer | viewer@skyterra.co.id | Viewer#2026 |

Aturan akses per halaman diatur di `src/lib/roles.ts`. Isi `AUTH_SECRET` di `.env.local` sebelum menjalankan di production.

---

## Tech Stack

- **Frontend:** Next.js (React), Tailwind CSS
- **Icons & Charts:** Lucide Icons, Recharts
- **Backend:** Next.js API Routes / Server Actions
- **Database:** PostgreSQL / MySQL

---

## Memulai (Getting Started)

### Prasyarat

Pastikan Anda telah menginstal:
- [Node.js](https://nodejs.org/) (versi 18 ke atas)
- Package manager (`npm`, `yarn`, atau `pnpm`)

### Instalasi

1. **Clone repositori ini:**
   ```bash
   git clone https://github.com/username/project-skyterra.git
   cd project-skyterra
   ```

2. **Install dependensi:**
   ```bash
   npm install
   ```

3. **Atur environment variables:**  
   Salin berkas `.env.example` ke `.env.local` dan sesuaikan nilainya:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/skyterra"
   NEXTAUTH_SECRET="your-secret-key"
   ```

4. **Jalankan development server:**
   ```bash
   npm run dev
   ```

5. Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.

---

## Perintah yang Tersedia (Scripts)

| Perintah | Deskripsi |
| :--- | :--- |
| `npm run dev` | Menjalankan server lokal mode pengembangan |
| `npm run build` | Membuat build aplikasi untuk produksi |
| `npm run start` | Menjalankan aplikasi hasil build produksi |
| `npm run lint` | Memeriksa format dan kesalahan kode (*linting*) |
