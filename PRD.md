# Product Requirements Document (PRD)

## Sistem Absensi Anak Magang

|                   |                 |
| ----------------- | --------------- |
| **Versi Dokumen** | 2.0             |
| **Tanggal**       | 11 Agustus 2026 |
| **Status**        | Draft           |

---

## 1. Overview

Sistem absensi digital untuk mengelola kehadiran ±110 anak magang. Menggantikan proses manual (Excel/kertas) yang rawan human error dan sulit direkap.

**Role pengguna**: hanya 2 —

- **Admin**: kelola data anak magang, approve/reject izin-sakit, lihat rekap semua anak magang, export laporan
- **Anak Magang**: check-in/check-out, lihat riwayat absensi sendiri, ajukan izin/sakit

Akun **tidak self-register** — dibuat oleh Admin (bisa bulk import via CSV/Excel) agar data selaras dengan kontrak magang dan bisa otomatis nonaktif saat masa magang berakhir.

**Validasi kehadiran** dilakukan lewat kombinasi: foto selfie + face detection (memastikan ada wajah, bukan verifikasi identitas) + validasi lokasi (GPS radius kantor dan/atau QR code) — cukup kuat mencegah titip absen tanpa kompleksitas face recognition.

## 2. Tech Stack

| Komponen           | Pilihan                                              |
| ------------------ | ---------------------------------------------------- |
| Frontend + Backend | Next.js (App Router) + TypeScript (strict)           |
| Styling            | Tailwind CSS v4                                      |
| Database           | PostgreSQL (Neon DB — free tier 512MB)                |
| ORM                | Drizzle ORM (type-safe, serverless-friendly)         |
| Autentikasi        | Auth.js v5 (NextAuth) — Credentials provider         |
| Storage foto       | Cloudinary (free tier 25GB)                          |
| Hosting            | Vercel                                               |
| Face detection     | face-api.js / MediaPipe Face Detection (client-side) |

**Catatan stack**:
- **Neon DB** dipilih karena free tier yang generous (512MB, auto-suspend/wake), tanpa risiko pause 7 hari seperti Supabase free
- **Drizzle ORM** dipilih karena ringan di serverless (zero cold start), type-safe, dan SQL-like syntax
- **Auth.js Credentials** dipilih karena akun dibuat oleh admin (bukan self-register), sehingga butuh kontrol penuh atas tabel users tanpa sinkronisasi 2 sumber data
- **Foto** dikompres & di-resize (maks. ±800×800px, format WebP) di sisi client sebelum upload untuk efisiensi kuota dan bandwidth

## 3. Feature

### 3.1 Fitur Inti (MVP)

- **Login** dengan akun yang dibuatkan admin (email/username + password, wajib ganti password saat login pertama)
- **Check-in / Check-out** dengan timestamp otomatis
- **Foto selfie** saat absen, disimpan ke Cloudinary
- **Face detection** (client-side) — tombol submit nonaktif jika kamera tidak menangkap wajah
- **Validasi lokasi**: GPS radius kantor
- **Status otomatis**: Hadir / Telat / Alpha / Izin / Sakit (berdasarkan jam masuk yang ditentukan)
- **Riwayat absensi pribadi** (tampilan kalender bulanan)
- **Pengajuan izin/sakit** dengan upload surat pendukung
- **Approval izin/sakit** oleh Admin
- **Kelola Master Data** Unit Kerja & Posisi (Admin)
- **Rekap kehadiran** per anak, per unit kerja, per periode (Admin)
- **Export laporan** ke Excel/PDF (Admin)
- **Bulk import** data anak magang via CSV (Admin)

### 3.2 Fitur Lanjutan (Fase Berikutnya)

- Notifikasi pengingat jika belum absen
- Auto-generate sertifikat magang berdasarkan rekap kehadiran
- Dashboard statistik kehadiran (grafik keterlambatan, tren kehadiran, dsb.)
- Auto-nonaktif akun saat masa magang selesai
- Reset password mandiri via email

### 3.3 Out of Scope

- Face recognition/verifikasi identitas otomatis
- Integrasi payroll/tunjangan
- Aplikasi mobile native (cukup web app responsif)
- Role tambahan (pembimbing, multi-divisi)

## 4. Data Model

**work_units**
| Field | Tipe | Keterangan |
|---|---|---|
| id | UUID/PK | |
| nama | string | nama unit kerja (misal: "Divisi IT", "Sekretariat") |
| kode | string | unique/nullable (misal: "TI", "SEK") |

**positions**
| Field | Tipe | Keterangan |
|---|---|---|
| id | UUID/PK | |
| nama | string | nama posisi (misal: "Frontend Developer", "Staff Admin") |

**users**
| Field | Tipe | Keterangan |
|---|---|---|
| id | UUID/PK | |
| nama | string | |
| email | string | unique, dipakai login |
| password_hash | string | di-hash dengan bcrypt |
| role | enum | `admin` \| `intern` |
| unit_kerja_id | FK → work_units | nullable (untuk intern) |
| posisi_id | FK → positions | nullable (untuk intern) |
| tanggal_mulai | date | mulai magang |
| tanggal_selesai | date | akhir magang |
| must_change_password | boolean | default true, wajib ganti password saat login pertama |
| status_aktif | boolean | untuk nonaktifkan akun |

**attendance**
| Field | Tipe | Keterangan |
|---|---|---|
| id | UUID/PK | |
| user_id | FK → users | |
| tanggal | date | |
| jam_masuk | timestamp | nullable |
| jam_keluar | timestamp | nullable |
| foto_masuk_url | string | Cloudinary URL |
| foto_keluar_url | string | Cloudinary URL |
| lokasi_masuk | geopoint/string | lat,long atau ref QR |
| lokasi_keluar | geopoint/string | |
| status | enum | `hadir` \| `telat` \| `alpha` \| `izin` \| `sakit` |

**leave_requests**
| Field | Tipe | Keterangan |
|---|---|---|
| id | UUID/PK | |
| user_id | FK → users | |
| tanggal | date | |
| jenis | enum | `izin` \| `sakit` |
| keterangan | text | |
| file_surat_url | string | nullable, Cloudinary URL |
| status_approval | enum | `pending` \| `approved` \| `rejected` |
| approved_by | FK → users | admin yang approve |

**app_settings**
| Field | Tipe | Keterangan |
|---|---|---|
| id | UUID/PK | |
| key | string | unique, identifier pengaturan (misal: `office_lat`, `office_lng`) |
| value | string | nilai pengaturan, disimpan sebagai string (parse sesuai kebutuhan) |
| description | string | nullable, deskripsi untuk admin |
| updated_at | timestamp | otomatis di-update saat nilai berubah |

**Default settings yang akan di-seed:**
| Key | Default Value | Keterangan |
|---|---|---|
| `office_lat` | *(kosong, diisi admin)* | Latitude kantor |
| `office_lng` | *(kosong, diisi admin)* | Longitude kantor |
| `office_radius_m` | `100` | Radius validasi GPS dalam meter |
| `jam_masuk` | `08:00` | Jam batas masuk (setelah ini dianggap telat) |
| `jam_keluar` | `17:00` | Jam minimal keluar |
| `nama_instansi` | `Green Attendance` | Nama instansi yang tampil di UI |

## 5. Phases

**Fase 1 — MVP user (target rilis awal)**

- login user
- Check-in/check-out + foto selfie + face detection + validasi lokasi
- Pengajuan izin/sakit
- riwayat absensi (termasuk riwayat izin)

**Fase 2 — MVP admin**

- admin login
- manajemen master data (unit kerja & posisi)
- manajemen data anak magang (termasuk bulk import)
- approval izin/sakit
- rekap absensi (termasuk rekap izin & filter per unit kerja)
- export laporan

**Fase 3 — Penyempurnaan**

- Notifikasi pengingat absen
- Reset password mandiri

## 6. Kebutuhan Non-Fungsional

- **Skalabilitas**: sanggup menangani ±110 user dengan traffic bersamaan di jam absen (08.00 & 17.00)
- **Keamanan**: password ter-hash, akses data terbatas sesuai role, HTTPS
- **Retensi data**: data absensi (jam & status) disimpan permanen; foto dapat diatur retensi untuk efisiensi storage
- **Ketersediaan**: dapat diakses via browser (desktop & mobile-responsive)

## 7. Metrik Keberhasilan

- Adopsi: 100% anak magang berhasil onboarding & login dalam 1 minggu pertama
- Akurasi rekap: pengurangan selisih data absensi manual vs sistem
- Waktu rekap laporan: dari manual (berjam-jam) menjadi otomatis (<5 menit export)

## 8. Risiko & Mitigasi

| Risiko                             | Mitigasi                                   |
| ---------------------------------- | ------------------------------------------ |
| Titip absen tanpa face recognition | Kombinasi face detection + GPS code lokasi |
| Storage foto membengkak            | Kompresi otomatis + kebijakan retensi foto |
| Anak magang lupa password          | Reset password mandiri via email (Fase 2)  |

## 9. Design

- desain terdiri dari dua halaman utama yaitu untuk Admin dan untuk anak magang
- referensi desain user dapat di lihat di folder desain_inspirasi
- desain dashboard admin kita kerjakan nanti
