# Indeks Dokumentasi Proyek (`docs/`)

Folder ini berisi dokumentasi teknis, desain, dan panduan kolaborasi tim untuk repository **Ceashyr PWA**.

> **Mulai dari mana?**
> Jika Anda menggunakan AI coding agent (Claude Code, Cursor, Codex, Copilot, Gemini, Antigravity, dll.), baca terlebih dahulu [`AGENT.md`](../AGENT.md) di root repository, lalu lanjutkan ke dokumen yang relevan di bawah ini.

---

## Daftar Dokumen Utama

| File | Topik Utama | Kapan Dibaca |
| :--- | :--- | :--- |
| [`AGENT.md`](../AGENT.md) | Aturan wajib arsitektur, batas data, RBAC, PWA, Git, dan DoD untuk semua AI agent | **Wajib** sebelum mulai mengedit kode |
| [`01-PROJECT-OVERVIEW.md`](01-PROJECT-OVERVIEW.md) | Konteks bisnis Kantin KWU HIMATEKPAL ITS, 6 pain points mitra, peran pengguna, backlog `US-01`..`US-16` | Saat memahami kebutuhan User Story |
| [`02-ARCHITECTURE-AND-PWA.md`](02-ARCHITECTURE-AND-PWA.md) | Konsep PWA offline-first, `manifest.json`, `public/sw.js`, dan struktur awal Sprint 1 | Saat menyentuh caching PWA atau struktur awal |
| [`03-DESIGN-SYSTEM-FIGMA.md`](03-DESIGN-SYSTEM-FIGMA.md) | Palet warna `ceashyr-*`, shadow, dimensi tablet `1280×800`, dan peta node Figma `1331:4912` | Saat membuat atau menata komponen UI baru |
| [`04-USER-FLOWS-AND-PROTOTYPE.md`](04-USER-FLOWS-AND-PROTOTYPE.md) | Alur layar dan interaksi pengguna antar-halaman | Saat merancang transisi atau UX baru |
| [`05-AGILE-ARCHITECTURE-GUIDE.md`](05-AGILE-ARCHITECTURE-GUIDE.md) | Peta direktori hasil refactor, playbook tambah fitur Sprint 2+, migrasi ke SQL terpusat, dan swap `OcrEngine` | Saat membangun fitur baru atau integrasi backend |
| [`06-TEAM-AGENT-WORKFLOW.md`](06-TEAM-AGENT-WORKFLOW.md) | Panduan kerja paralel tim multi-agent, kepemilikan folder, template task prompt universal, & checklist review PR | Saat pembagian tugas tim & review PR |
| [`desain-halaman-laporan-penjualan-US15.pdf`](desain-halaman-laporan-penjualan-US15.pdf) | Referensi visual halaman Laporan Penjualan (`US-15`) | Saat memodifikasi halaman `/laporan` |

---

## Arsip Spesifikasi Task Sprint 1 (`docs/tasks/`)

Folder `docs/tasks/` menyimpan rincian *Acceptance Criteria* dan pemetaan task Sprint 1 (`H-01`..`H-12`):

- [`00-INDEX-FOR-HYDROGEN.md`](00-INDEX-FOR-HYDROGEN.md) — Panduan historis eksekusi Sprint 1 (untuk panduan universal terbaru, rujuk `AGENT.md`).
- [`tasks/TASK-BOARD-CHECKLIST.md`](tasks/TASK-BOARD-CHECKLIST.md) — Pemetaan 21 tugas Sprint 1 ke task `H-01`..`H-12`.
- [`tasks/T-01-US04-AUTH-AND-ROLES.md`](tasks/T-01-US04-AUTH-AND-ROLES.md) — `US-04`: Login, Register, Forgot Password, & Pembagian Peran.
- [`tasks/T-02-US01-PRODUCTS-MANAGEMENT.md`](tasks/T-02-US01-PRODUCTS-MANAGEMENT.md) — `US-01`: Daftar, Detail, & Tambah Produk.
- [`tasks/T-03-US05-SALES-POS.md`](tasks/T-03-US05-SALES-POS.md) — `US-05` & `US-06`: Kasir POS & Pengurangan Stok Otomatis.
- [`tasks/T-04-US16-OCR-PAPER-REPORT.md`](tasks/T-04-US16-OCR-PAPER-REPORT.md) — `US-16`: Foto Laporan Kertas, OCR, & Antrean Offline.
- [`tasks/T-05-MOBILE-RESPONSIVE-PWA.md`](tasks/T-05-MOBILE-RESPONSIVE-PWA.md) — Audit Responsif Mobile `<768px` & PWA Installability.
