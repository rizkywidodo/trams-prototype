## Konsep Utama

Form Patrol bisa diisi berkali-kali per hari (setiap entry = record terpisah dengan nama pengisi & waktu). Logbook hanya bisa di-submit kalau **semua checklist item** di Form Patrol sudah tercentang (gabungan dari semua entry patrol hari itu).

## Perubahan

### 1. Data Layer — Patrol Records Store
- Buat `src/hooks/use-patrol-records.ts` — hook untuk menyimpan & mengelola multiple patrol entries per hari per stasiun di localStorage
- Setiap record: `{ id, stationId, date, shift, filledBy, filledAt, checklist: {...} }`
- Fungsi: `addPatrolRecord()`, `getPatrolRecords(stationId, date)`, `getCompletionStatus(stationId, date)` (cek apakah semua item sudah tercentang dari gabungan semua records)

### 2. Update Form Patrol (`FormPatrol.tsx`)
- Ubah flow: setiap submit = **tambah record baru** (bukan replace)
- Tambah input "Nama Pengisi" di form
- Setelah submit, data disimpan sebagai entry baru via hook
- Tampilkan daftar patrol entries yang sudah ada hari ini (nama, waktu, jumlah item dicentang)

### 3. Update Logbook (`Logbook.tsx`)
- Sebelum tombol Submit: cek completion status Form Patrol via hook
- Kalau belum 100%: tombol Submit disabled + warning message ("Form Patrol belum lengkap: 45/60 item tercentang")
- Kalau sudah 100%: Submit enabled, proceed seperti biasa

### 4. Update Riwayat Laporan (`DailyReportHistory.tsx`)
- Status di list/calendar sekarang reflect data real dari localStorage (patrol records + logbook drafts)
- Klik tanggal → bisa lihat detail: daftar patrol entries + logbook data

### 5. Patrol History Component
- Buat komponen kecil yang menampilkan daftar patrol entries hari ini (bisa dilihat dari Form Patrol & dari Logbook)
- Setiap entry: nama pengisi, waktu, jumlah item checked, bisa expand untuk lihat detail
