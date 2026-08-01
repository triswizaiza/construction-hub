# 📊 Panduan Menghubungkan Construction Hub ke Google Drive (Google Sheets)

Dengan mengikuti 3 langkah mudah ini, **semua data yang Anda input dari HP & Laptop akan otomatis tersimpan & tersinkronisasi di file Google Sheets yang ada di Google Drive Anda!**

---

## 🛠️ Langkah 1: Buat File Google Sheets
1. Buka [Google Drive Anda](https://drive.google.com/).
2. Klik tombol **New (Baru)** -> **Google Sheets (Spreadsheet Baru)**.
3. Beri nama spreadsheet tersebut, contohnya: `Construction_Hub_Database`.

---

## 🛠️ Langkah 2: Tempelkan Kode Apps Script
1. Di dalam Google Sheets tersebut, klik menu **Extensions (Ekstensi)** -> **Apps Script**.
2. Hapus semua kode bawaan yang ada di situ.
3. Salin (*copy*) seluruh isi kode dari file [google-script.js](file:///d:/Iza/AI/Excel%20Advanced/construction-hub/google-script.js) di repositori Anda, lalu tempel (*paste*) ke Apps Script.
4. Klik ikon **Save 💾** di bagian atas.

---

## 🛠️ Langkah 3: Publikasikan Web App & Ambil URL
1. Di kanan atas Apps Script, klik tombol biru **Deploy (Terapkan)** -> **New deployment (Penerapan baru)**.
2. Di samping kata *Select type*, klik ikon gerigi ⚙️ -> pilih **Web app**.
3. Isi Pengaturan:
   - **Description**: `Construction Hub Sync API`
   - **Execute as**: `Me (Email Anda)`
   - **Who has access**: **`Anyone (Siapa saja)`**  *(Penting agar HP & Laptop dapat membaca data)*
4. Klik **Deploy** -> Berikan Izin (*Grant Access*) -> Login dengan akun Google Anda.
5. Salin URL Web App yang diberikan (contohnya: `https://script.google.com/macros/s/AKfycbx.../exec`).

---

## 🔗 Langkah 4: Hubungkan ke Aplikasi Construction Hub
1. Buka web aplikasi Anda: [https://triswizaiza.github.io/construction-hub/](https://triswizaiza.github.io/construction-hub/)
2. Klik ikon **Google Drive 📁 (Cloud Sync)** di sebelah tombol notifikasi / user header.
3. Tempelkan URL Web App dari Langkah 3, lalu klik **Hubungkan & Sinkronkan**.
4. Selesai! Sekarang semua HP & Laptop tim Anda terhubung ke 1 Google Sheets di Google Drive yang sama! 🎉
