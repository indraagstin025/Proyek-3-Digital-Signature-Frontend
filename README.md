# Signify - Frontend Aplikasi (React.js) 🖥️

Ini adalah repositori untuk bagian **frontend** dari aplikasi tanda tangan digital Signify. Dibangun dengan React.js, antarmuka ini menyediakan pengalaman pengguna yang modern, interaktif, dan responsif untuk semua fitur pengelolaan dan penandatanganan dokumen.

---
## 🖼️ Tampilan Aplikasi


*(Letakkan screenshot dari aplikasi Anda di sini untuk memberikan gambaran visual)*

---
## ✨ Fitur Utama

* **Antarmuka Responsif**: Didesain dengan Tailwind CSS agar terlihat bagus di semua perangkat, dari desktop hingga mobile.
* **Navigasi Cepat**: Menggunakan React Router untuk perpindahan halaman yang mulus tanpa perlu me-refresh.
* **Manajemen Profil**: Pengguna dapat mengedit profil dan mengelola riwayat foto mereka secara *real-time*.
* **Alur Kerja Dokumen**: Antarmuka intuitif untuk mengunggah, melihat, dan menandatangani dokumen.
* **Notifikasi Instan**: Umpan balik langsung kepada pengguna untuk setiap aksi (sukses atau gagal) menggunakan React Hot Toast.
* **Autentikasi Aman**: Terintegrasi dengan Supabase untuk alur login dan registrasi yang aman.

---
## 🛠️ Teknologi yang Digunakan

* **Framework**: React.js
* **Build Tool**: Vite
* **Styling**: Tailwind CSS
* **Routing**: React Router DOM
* **API Client**: Axios
* **Notifikasi**: React Hot Toast
* **Manajemen State**: React Context & Hooks

---
## 🚀 Instalasi dan Konfigurasi

Ikuti langkah-langkah ini untuk menjalankan frontend di lingkungan lokal Anda.

### Prasyarat

* [Node.js](https://nodejs.org/) (versi LTS)
* `npm` (sudah terinstal bersama Node.js)
* [Git](https://git-scm.com/)

### Langkah-langkah Instalasi

1.  **Clone Repository Frontend**
    ```bash
    git clone [URL_FRONTEND_REPO_ANDA]
    cd nama-folder-frontend
    ```

2.  **Instal Dependensi**
    Perintah ini akan menginstal React dan semua library lain yang tercantum di `package.json`.
    ```bash
    npm install
    ```

3.  **Konfigurasi Environment Variable**
    Frontend membutuhkan beberapa kunci untuk terhubung ke backend dan Supabase.

    * Salin file contoh `.env.example` menjadi `.env`:
        ```bash
        cp .env.example .env
        ```
    * Buka file `.env` dan isi nilainya:
        ```env
        # URL server backend Anda.
        # Jika backend berjalan di port 3000, URL-nya akan seperti ini:
        VITE_API_BASE_URL="http://localhost:3000/api"

        # Kunci dari proyek Supabase Anda (sama seperti di backend)
        VITE_SUPABASE_URL="URL_PROYEK_SUPABASE_ANDA"
        VITE_SUPABASE_ANON_KEY="KUNCI_ANON_SUPABASE_ANDA"
        ```

### 🏃 Menjalankan Aplikasi

Setelah semua dependensi terinstal dan `.env` dikonfigurasi, Anda bisa menjalankan server development.

* **Menjalankan Server Development (dengan Hot-Reload)**
    ```bash
    npm run dev
    ```
    Buka browser dan akses URL yang ditampilkan di terminal (biasanya `http://localhost:5173`).

* **Membuat Build untuk Produksi**
    ```bash
    npm run build
    ```
    Perintah ini akan membuat folder `dist` yang berisi file-file statis yang siap untuk di-deploy.

* **Menjalankan Build Produksi secara Lokal**
    ```bash
    npm run preview
    ```
    Perintah ini berguna untuk melihat versi produksi dari aplikasi Anda secara lokal.

### 🔗 Koneksi ke Backend

Penting: **Frontend ini tidak dapat berfungsi tanpa backend.** Pastikan server backend dari proyek ini juga sedang berjalan agar aplikasi dapat melakukan panggilan API untuk data.

---
## 📂 Struktur Folder

```
/src
├── /components     # Komponen UI kecil yang dapat digunakan kembali (Tombol, Modal, dll.)
├── /pages          # Komponen untuk setiap halaman utama (Login, Dashboard, Profile, dll.)
├── /services       # Logika untuk berkomunikasi dengan API (apiClient.js, userService.js, dll.)
├── /hooks          # Custom hooks (misal: useAuth)
├── /contexts       # React Context untuk manajemen state global
├── App.jsx         # Komponen utama dan routing
└── main.jsx        # Titik masuk utama aplikasi React
```

---
## 📄 Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT.