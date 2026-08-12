# 🌿 Sistem Absensi Digital Anak Magang

Sistem manajemen kehadiran digital modern untuk mengelola absensi anak magang berbasis **Next.js 16 (App Router)**, **TypeScript**, **Drizzle ORM**, **PostgreSQL**, **Cloudflare R2 Storage**, dan **Web Push Notifications**.

Aplikasi ini dirancang untuk menggantikan rekap manual, mencegah kecurangan presensi (_titip absen_) lewat kombinasi **Client-Side Face Detection**, **Validasi Radius GPS Kantor**, serta **Foto Selfie Real-time**.

---

## 🚀 Fitur Utama

### 👨‍🎓 Panel Anak Magang

- 🔐 **Autentikasi Aman**: Login berbasis peran (_intern_) dengan mekanisme wajib ubah password saat login pertama kali.
- 📸 **Absen Masuk & Keluar (Check-in / Check-out)**:
  - Deteksi wajah otomatis di browser (_Client-Side Face Detection_).
  - Validasi jarak GPS terhadap koordinat lokasi kantor.
  - Kompresi foto selfie WebP & pengunggahan otomatis ke Cloudflare R2.
- 📅 **Riwayat Absensi Personal**: Tampilan rekap status kehadiran per bulan.
- 📝 **Pengajuan Izin / Sakit**: Form pengajuan izin dengan validasi bentrok tanggal & upload berkas surat pendukung.
- 🔔 **Push Notification**: Pengingat absensi di layar HP / Desktop browser.

### 🛡️ Panel Administrator

- 📊 **Dashboard Audit & Statistik**:
  - Ringkasan kehadiran harian (Hadir, Terlambat, Pending Approval).
  - Grafik tren kehadiran 7 hari terakhir.
  - **Feed Audit Foto Selfie Harian**: Verifikasi foto & lokasi GPS presensi anak magang secara _real-time_ lengkap dengan modal lightbox perbesar foto.
- 📋 **Kelola Data Anak Magang**:
  - Tambah, edit, nonaktifkan akun, atau reset password ke default.
  - **Bulk Import Data**: Tambah banyak akun sekaligus menggunakan file **Excel (`.xlsx`, `.xls`)** atau **CSV**.
- 🏢 **Kelola Master Data**: Pengaturan Unit Kerja & Posisi Jabatan.
- ⚙️ **Pengaturan Sistem (App Settings)**:
  - Pengaturan koordinat Latitude & Longitude kantor (fitur _Gunakan GPS Saya_).
  - Pengaturan radius GPS (meter), jam masuk tepat waktu, dan jam pulang.
  - Broadcast pengingat presensi ke seluruh perangkat anak magang aktif.
- 📑 **Approval Izin & Sakit**: Persetujuan atau penolakan pengajuan izin/sakit dengan sinkronisasi status absensi otomatis.
- 📊 **Export Rekap Excel Multi-Tab**:
  - **Tab 1 (`Ringkasan Presensi`)**: Total hadir, telat, izin, sakit, alpha, & persentase kehadiran.
  - **Tab 2 (`Presensi Harian Full`)**: Matriks status presensi tanggal 01 s/d akhir bulan untuk seluruh anak magang.

---

## 🛠️ Teknologi & Stack (Tech Stack)

| Komponen          | Teknologi               | Keterangan                                   |
| :---------------- | :---------------------- | :------------------------------------------- |
| **Framework**     | Next.js 16 (App Router) | React 19, Server Components & Server Actions |
| **Bahasa**        | TypeScript              | Strict mode type-safety                      |
| **Database**      | PostgreSQL              | Supabase / Neon / Railway                    |
| **ORM**           | Drizzle ORM             | Type-safe SQL query & migrations             |
| **Autentikasi**   | Auth.js v5 (NextAuth)   | Credentials Provider + bcrypt hashing        |
| **Storage Foto**  | Cloudflare R2           | 10 GB Free Forever S3-Compatible Storage     |
| **Deteksi Wajah** | `face-api.js`           | Client-side Canvas face detection            |
| **Notifikasi**    | Web Push API            | Service Worker + VAPID WebPush               |
| **Styling**       | Tailwind CSS v4         | Responsive UI Modern dengan Lucide Icons     |

---

## 💻 Panduan Instalasi & Pengembangan Lokal (Development Setup)

### 1. Prasyarat

- Node.js versi 18.x atau lebih baru.
- Database PostgreSQL (misal akun gratis [Supabase](https://supabase.com) atau [Neon](https://neon.tech)).

### 2. Clone & Install Dependencies

```bash
# Install seluruh paket dependensi
npm install --legacy-peer-deps
```

### 3. Konfigurasi Environment Variables

Buat file `.env.local` di direktori utama proyek, lalu isi sesuai kredensial Anda:

```env
# PostgreSQL Database URL
DATABASE_URL="postgresql://user:password@host:6543/postgres"

# Auth.js v5 Secret (Bisa generate via: npx auth secret)
AUTH_SECRET="rahasia-auth-key-bebas-32-karakter"
NEXTAUTH_URL="http://localhost:3000"

# Cloudflare R2 Storage (Opsional saat dev, fallback otomatis ke Base64 jika kosong)
CLOUDFLARE_R2_ACCOUNT_ID="account_id_cloudflare_anda"
CLOUDFLARE_R2_ACCESS_KEY_ID="access_key_r2_anda"
CLOUDFLARE_R2_SECRET_ACCESS_KEY="secret_key_r2_anda"
CLOUDFLARE_R2_BUCKET_NAME="maganghan-attendance"
CLOUDFLARE_R2_PUBLIC_DOMAIN="https://pub-xxxx.r2.dev"

# Web Push Notification VAPID Keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY="BBzuS-c50FJFFHvVffDQ8ZPMbJOWaoVCr3e-w4O8WSU4b00TOOMQsDIvt1X5fjW293Ios9hLM40m9lLHKl_yspE"
VAPID_PRIVATE_KEY="eawYt9x8lBq1cmA0vrW42viEyW65oyEZvAND1MsFYSs"
VAPID_SUBJECT="mailto:admin@maganghan.com"
```

### 4. Push Schema Database & Seed Data Testing

```bash
# Push skema tabel Drizzle ke PostgreSQL
npx drizzle-kit push

# Seed data dummy untuk kebutuhan testing/development
npm run db:seed:dev:fresh
```

### 5. Jalankan Server Development

```bash
npm run dev
```

Buka browser di `http://localhost:3000`.

#### 🔑 Akun Default Testing (Dev Mode):

- **Admin**: `admin@magang.local` / Password: `admin123`
- **Intern 1**: `rachel@magang.local` / Password: `magang123`
- **Intern 2**: `budi@magang.local` / Password: `magang123`

---

## 🌐 Panduan Deployment ke Produksi (Production Setup)

### Langkah 1: Persiapan Database PostgreSQL (Supabase / Neon)

1. Buat proyek baru di [Supabase](https://supabase.com) atau provider PostgreSQL lainnya.
2. Dapatkan **Connection String (Transaction Pooler / Direct Connection)**.

### Langkah 2: Persiapan Cloudflare R2 Storage

1. Buka dashboard Cloudflare ➔ **R2 Object Storage** ➔ Buat Bucket baru (misal: `maganghan-prod`).
2. Masuk ke **Settings** bucket ➔ Di bagian **Public Access**, aktifkan **Public Development URL** (`r2.dev`).
3. Buka **Manage R2 API Tokens** ➔ Buat API Token dengan izin **Admin Read & Write**.
4. Catat **Account ID**, **Access Key ID**, dan **Secret Access Key**.

### Langkah 3: Atur Environment Variables di Platform Hosting (Vercel / Server)

Isikan variabel berikut pada menu Environment Variables di Vercel / server Anda:

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="kunci-rahasia-produksi-anda"
NEXTAUTH_URL="https://domaininginanda.com"

# Admin Kustom untuk Seed Produksi
ADMIN_EMAIL="admin.utama@instansi.go.id"
ADMIN_PASSWORD="PasswordKuat2026!"

# Cloudflare R2 Storage
CLOUDFLARE_R2_ACCOUNT_ID="your_account_id"
CLOUDFLARE_R2_ACCESS_KEY_ID="your_access_key_id"
CLOUDFLARE_R2_SECRET_ACCESS_KEY="your_secret_access_key"
CLOUDFLARE_R2_BUCKET_NAME="maganghan-prod"
CLOUDFLARE_R2_PUBLIC_DOMAIN="https://pub-xxxx.r2.dev"

# Web Push VAPID
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your_vapid_public_key"
VAPID_PRIVATE_KEY="your_vapid_private_key"
VAPID_SUBJECT="mailto:admin@instansi.go.id"
```

### Langkah 4: Inisialisasi Database Produksi (Push & Clean Seed)

Jalankan perintah berikut melalui terminal lokal yang terhubung ke database produksi:

```bash
# 1. Terapkan skema database ke server produksi
npx drizzle-kit push

# 2. Jalankan Fresh Production Seed (Membersihkan data lama & membuat 1 Super Admin Utama)
npm run db:seed:fresh
```

### Langkah 5: Build & Deploy

- Di Vercel / Hosting: Hubungkan repository GitHub Anda. Vercel akan otomatis meng-compile dengan perintah `npm run build`.

#### 🔐 Keamanan Admin Produksi:

- Setelah seed selesai, Super Admin pertama dapat login dengan kredensial dari `ADMIN_EMAIL` dan `ADMIN_PASSWORD`.
- Pada login pertama kali, Admin **diwajibkan untuk langsung memperbarui kata sandinya**.

---

## 📜 Perintah CLI yang Tersedia (Scripts)

| Perintah                    | Fungsi                                                                        |
| :-------------------------- | :---------------------------------------------------------------------------- |
| `npm run dev`               | Menjalankan Next.js server lokal development                                  |
| `npm run build`             | Melakukan compile proyek untuk produksi                                       |
| `npm run start`             | Menjalankan server produksi                                                   |
| `npx drizzle-kit push`      | Menyinkronkan skema Drizzle ke database PostgreSQL                            |
| `npm run db:seed:fresh`     | **Produksi Fresh Reset**: Menghapus seluruh data lama & membuat 1 Admin utama |
| `npm run db:seed:dev:fresh` | **Dev Fresh Reset**: Menghapus data lama & mengisi data dummy testing         |
| `npm run db:seed`           | Menambahkan data dummy tanpa menghapus data yang sudah ada                    |

---

## 📁 Struktur Direktori Proyek

```
maganghan/
├── public/
│   ├── sw.js                     # Service Worker untuk Web Push Notifications
│   └── favicon.ico
├── src/
│   ├── actions/                  # Next.js Server Actions (Data mutations & queries)
│   │   ├── admin.ts              # Dashboard stats & photo audit feed actions
│   │   ├── adminProfile.ts       # Profile & password admin actions
│   │   ├── adminUser.ts          # Kelola user admin actions
│   │   ├── attendance.ts         # Check-in, check-out & validation actions
│   │   ├── intern.ts             # CRUD intern & bulk import Excel actions
│   │   ├── leaveRequest.ts       # Pengajuan & approval izin actions
│   │   ├── masterData.ts         # Unit kerja & posisi actions
│   │   ├── pushNotification.ts   # Web Push notification actions
│   │   ├── rekap.ts              # Rekap bulanan & export matrix actions
│   │   └── settings.ts           # App settings actions
│   ├── app/                      # Next.js App Router (Pages & Layouts)
│   │   ├── (auth)/               # Auth pages (login, change-password)
│   │   ├── (dashboard)/          # Dashboard layout & protected routes
│   │   │   ├── admin/            # Pages khusus Admin
│   │   │   └── intern/           # Pages khusus Anak Magang
│   │   └── api/                  # API routes (Auth.js endpoint)
│   ├── components/               # React Components
│   │   ├── features/             # Feature-specific components
│   │   └── ui/                   # Reusable UI Base Components
│   ├── lib/
│   │   ├── auth/                 # Auth.js configuration
│   │   ├── db/                   # Drizzle schema, connection, & seed scripts
│   │   │   ├── schema.ts         # Tabel PostgreSQL Drizzle definitions
│   │   │   ├── seed.ts           # Dev seed script
│   │   │   └── seedProd.ts       # Production seed script
│   │   └── utils/                # Geo location & Cloudflare R2 utilities
│   └── types/                    # Shared TypeScript definitions
├── PRD.md                        # Product Requirements Document
├── README.md                     # Dokumentasi Proyek
├── package.json
└── next.config.ts
```

---

## 📄 Lisensi

Hak Cipta © 2026 **Sistem Absensi Anak Magang**. Seluruh hak cipta dilindungi undang-undang.
