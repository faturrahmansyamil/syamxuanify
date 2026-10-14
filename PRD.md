# PRD — Syamxuanify

**Domain:** syamxuanify.biz.id
**Versi:** 1.0 (MVP)
**Pemilik:** Syam (Faturrahman Syamil)
**Tech:** Next.js + Supabase, deploy ke Vercel

---

## 1. Ringkasan

Syamxuanify adalah web etalase (katalog) tempat mahasiswa kampus memajang dan menjual produknya. Web **tidak memproses pembayaran**: pembeli langsung chat penjual lewat WhatsApp dan membayar ke QRIS milik penjual.

---

## 2. Buat Siapa

| Pengguna | Siapa mereka | Yang mereka butuhkan |
|---|---|---|
| **Penjual** | Mahasiswa yang jualan kecil-kecilan (jajanan, jasa, produk digital, fashion) | Tempat pajang produk yang rapi dan gampang dibagikan |
| **Pembeli** | Mahasiswa dan warga sekitar kampus | Cari "siapa jual apa" di kampus dengan cepat |
| **Admin** | Syam (pemilik web) | Menjaga isi web tetap aman dan terpercaya |

---

## 3. Masalah yang Diselesaikan

**Untuk penjual**
- Jualan cuma lewat story WA atau grup kelas, jadi cepat tenggelam.
- Tidak punya katalog rapi; harus kirim foto dan harga berulang-ulang.
- Bikin toko online sendiri terlalu ribet dan mahal.

**Untuk pembeli**
- Susah tahu siapa saja yang jualan di kampus.
- Info produk tersebar di banyak grup.
- Ragu apakah penjualnya bisa dipercaya.

**Solusi Syamxuanify:** satu tempat untuk semua jualan anak kampus, dengan link toko yang mudah dibagikan, dan transaksi langsung ke penjual tanpa ribet.

---

## 4. Fitur Inti (Wajib Ada di MVP)

### A. Pembeli
1. **Beranda** dengan pencarian dan filter kategori (Makanan & Jajanan, Produk Digital, Jasa, Fashion, Lainnya).
2. **Halaman produk:** foto, judul, harga, deskripsi, info toko.
3. **Tombol Chat WhatsApp** dengan pesan otomatis: "Halo, saya mau beli [produk] (Rp ...) dari Syamxuanify".
4. **Gambar QRIS penjual** yang bisa diperbesar.
5. **Halaman toko** (`/toko/nama-toko`) berisi semua produk penjual.
6. **Tombol Laporkan** untuk produk atau toko yang mencurigakan.
7. **Peringatan:** "Transaksi dilakukan langsung dengan penjual. Syamxuanify tidak memproses pembayaran."

### B. Penjual
1. **Daftar dan login** (email + password).
2. **Buka toko:** nama toko, deskripsi, nomor WA, logo, upload QRIS.
3. **Kelola produk:** tambah, edit, hapus (judul, harga, deskripsi, foto, kategori).
4. **Lihat status** toko dan produk: menunggu, disetujui, atau ditolak.

### C. Admin
1. **Setujui atau tolak** toko dan produk baru.
2. **Beri label "Terverifikasi"** untuk penjual yang sudah dicek (misalnya pakai KTM).
3. **Lihat laporan** dari pembeli dan hapus produk yang melanggar.
4. **Kelola peran** pengguna (admin, penjual, pembeli).

---

## 5. Alur Utama

### Alur Pembeli
```
Buka web → Cari / filter produk → Buka halaman produk
→ Klik "Chat WhatsApp" → Sepakat dengan penjual
→ Bayar ke QRIS penjual → Kirim bukti → Terima produk
```

### Alur Penjual
```
Daftar → Buka toko (isi WA + QRIS) → Tunggu disetujui admin
→ Upload produk → Tunggu disetujui → Produk tampil
→ Bagikan link toko → Terima chat pembeli di WA
```

### Alur Admin
```
Login → Cek toko & produk baru → Setujui / tolak
→ Cek laporan → Hapus yang melanggar
```

---

## 6. Di Luar Lingkup MVP (Nanti Saja)

- Pembayaran di dalam web (payment gateway)
- Keranjang belanja dan checkout
- Rating dan ulasan
- Chat di dalam web
- Notifikasi otomatis
- Aplikasi Android / iOS
- Bot auto order

---

## 7. Tahapan Pengerjaan

| Tahap | Isi | Status |
|---|---|---|
| 1 | Fondasi: project, Supabase, database, login & daftar | Sedang berjalan |
| 2 | Halaman pembeli: beranda, produk, toko, laporkan | Selesai |
| 3 | Dashboard penjual | Selesai |
| 4 | Panel admin | Selesai |
| 4.5 | Pelengkap sebelum online: lupa password, ubah toko, alasan ditolak, batas foto, syarat & tentang, tampilan HP, preview tautan, status stok | Selesai |
| 4.6 | Poles tampilan mengikuti DESIGN.md, aksen biru: logo, search, kartu, footer | Selesai |
| 4.7 | Pengaturan terpisah: admin, penjual, dan akun pembeli | Selesai |
| 4.8 | Panel admin jadi dashboard dengan sidebar dan halaman terpisah | Selesai |
| 4.9 | Halaman produk ala etalase: galeri, varian, stok, urutan beranda | Selesai |
| 5 | Deploy ke Vercel + pasang domain | Belum |
| 6 | Cari 10–20 penjual pertama dan promosi | Belum |

---

## 8. Ukuran Keberhasilan (Bulan Pertama)

- 20 penjual aktif dengan toko yang sudah disetujui
- Minimal 50 produk tampil
- Ada transaksi nyata lewat WhatsApp
- Tidak ada kasus penipuan yang dilaporkan

---

## 9. Risiko dan Cara Mengatasinya

| Risiko | Cara mengatasi |
|---|---|
| Penipuan oleh penjual | Persetujuan admin, label Terverifikasi, tombol Laporkan |
| Web sepi, tidak ada penjual | Pasangkan sendiri 10–20 penjual pertama, gratis |
| Tidak ada pembeli | Share di grup kampus, kerja sama dengan BEM / HIMA |
| Produk terlarang atau bajakan | Persetujuan admin sebelum produk tampil |
