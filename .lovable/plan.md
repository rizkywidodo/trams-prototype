## Perubahan

### 1. Hapus Checklist III dari SHIFTS (`src/data/patrol.ts`)
- Remove `{ id: "checklist-3", ... }` entry

### 2. Buat halaman gabungan Daily Report (`src/pages/DailyReport.tsx`)
- Header: pilih stasiun, tanggal & jam
- 2 tab utama: **Form Patrol** | **Logbook**
  - Tab Patrol: isi checklist per shift (reuse ShiftChecklist component), nama pengisi, catatan, signature, submit patrol record
  - Tab Logbook: isi catatan shift (gangguan, event, pekerjaan, keluhan), upload, submit logbook (gated by patrol 100%)
- Di bawah form: **Riwayat** — list beberapa laporan terakhir (tanggal, status patrol, status logbook) yang bisa diklik

### 3. Extract shared components
- `src/components/patrol/ShiftChecklist.tsx` — checklist per shift
- `src/components/patrol/SignatureCard.tsx` — signature card  
- `src/components/logbook/LogbookForm.tsx` — logbook sections

### 4. Update routing (`src/App.tsx`)
- Remove: `/daily-check/patrol`, `/daily-check/logbook`, `/daily-check/history`
- Add: `/daily-check/report`
- Redirect old paths to `/daily-check/report`

### 5. Update sidebar (`src/components/AppLayout.tsx`)
- Replace 3 menu items (Form Patrol, Logbook, Riwayat Laporan) with 1: "Daily Report"
- Update page title logic

### 6. Clean up old files
- Remove `src/pages/FormPatrol.tsx`, `src/pages/Logbook.tsx`, `src/pages/DailyReportHistory.tsx`
