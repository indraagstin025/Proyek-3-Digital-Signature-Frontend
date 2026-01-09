// src/constants/tourSteps.js

// src/constants/tourSteps.js

export const DASHBOARD_STEPS = [
  // 1. Welcome Message
  {
    target: 'body',
    placement: 'center',
    title: 'Selamat Datang di Dashboard!',
    content: 'Ini adalah pusat kendali aktivitas Anda. Mari kita lihat fitur utamanya.',
    disableBeacon: true,
  },
  
  // 2. Statistik Ringkas
  {
    target: '#dashboard-stats-grid',
    content: 'Di sini Anda bisa melihat ringkasan cepat dokumen yang sedang diproses, menunggu tanda tangan, atau sudah selesai.',
    placement: 'bottom',
  },

  // 3. Dokumen yang Butuh Tindakan
  {
    target: '#dashboard-actions',
    content: 'Jika ada dokumen yang perlu Anda tanda tangani atau review, dokumen tersebut akan muncul di daftar prioritas ini.',
    placement: 'top', // Supaya tidak tertutup jika di bawah layar
  },

  // 4. Menu Dokumen (Sidebar)
  {
    target: '#sidebar-nav-documents', // ID dari Sidebar.jsx tadi
    content: 'Ingin mengunggah dokumen baru atau mengelola file lama? Klik menu Dokumen di sini.',
    placement: 'right', // Muncul di sebelah kanan sidebar
    disableScroll: true, // Sidebar biasanya fixed, jadi matikan scroll halaman
  },

  // 5. Menu Pintasan (Shortcuts) - Opsional
  {
    target: '#sidebar-nav-shortcuts', 
    content: 'Gunakan menu Pintasan untuk akses cepat ke upload dan pembuatan grup.',
    placement: 'right',
    disableScroll: true,
  },

  // 6. Ringkasan Chart (Donut)
  {
    target: '#dashboard-summary',
    content: 'Visualisasi persentase dokumen Anda yang telah selesai vs yang masih berjalan.',
    placement: 'left', // Muncul di sebelah kiri chart
  },

  // 7. Profil & Logout
  {
    target: '#sidebar-profile-section',
    content: 'Kelola pengaturan akun Anda atau Logout melalui panel di pojok kiri bawah ini.',
    placement: 'right',
    disableScroll: true,
  },
];

export const SIGNING_STEPS_DESKTOP = [
  {
    target: 'body',
    placement: 'center',
    title: 'Mulai Menandatangani',
    content: 'Ini adalah lembar kerja Anda. Dokumen PDF ada di tengah, dan alat tanda tangan ada di Sidebar kanan.',
    disableBeacon: true,
  },
  {
    target: '#tour-signature-area',
    title: 'Buat Tanda Tangan',
    content: 'Klik di sini untuk membuat, mengetik, atau upload tanda tangan Anda.',
    placement: 'left',
  },
  {
    target: '#tour-ai-assistant',
    title: 'Asisten Legal AI',
    content: 'Analisis dokumen otomatis menggunakan AI sebelum Anda tanda tangan.',
    placement: 'left',
  },
  {
    target: '#tour-save-document',
    title: 'Simpan Dokumen',
    content: 'Klik tombol ini untuk menyimpan dokumen secara permanen.',
    placement: 'top',
  },
];

// 2. SKENARIO MOBILE (Menunjuk Floating Actions)
export const SIGNING_STEPS_MOBILE = [
  {
    target: 'body',
    placement: 'center',
    title: 'Mode Mobile',
    content: 'Tampilan disesuaikan untuk layar sentuh. Gunakan tombol melayang di kanan atas untuk aksi cepat.',
    disableBeacon: true,
  },
  {
    target: '#tour-mobile-sign', // Menunjuk Tombol Pena Biru
    title: 'Buat Tanda Tangan',
    content: 'Tap ikon Pena ini untuk membuka canvas tanda tangan.',
    placement: 'left',
  },
  {
    target: '#tour-mobile-ai', // Menunjuk Tombol Robot
    title: 'Asisten AI',
    content: 'Butuh bantuan analisis isi dokumen? Tap ikon Robot ini.',
    placement: 'left',
  },
  {
    target: '#tour-mobile-sidebar', // Menunjuk Tombol Tools
    title: 'Menu Lainnya',
    content: 'Tap ikon Tools ini untuk membuka sidebar penuh dan melihat opsi lainnya.',
    placement: 'left',
  },
];


export const SHORTCUTS_STEPS = [
{
    target: 'body', 
    content: 'Selamat datang di Pusat Kontrol! Ini adalah halaman utama untuk mengakses seluruh fitur WESIGN dengan cepat.',
    placement: 'center', // Muncul di tengah layar
    disableBeacon: true,
  },
  
  // 2. Tombol Quick Upload
  {
    target: '#btn-quick-upload', 
    content: 'Klik di sini untuk unggah dokumen secara instan.',
    placement: 'bottom',    
  },

  // 3. Tombol Buat Grup
  {
    target: '#btn-create-group', 
    content: 'Atau klik di sini untuk membuat Grup baru.',
    placement: 'bottom',
  },

  // 4. Card Overview (Scroll baru boleh aktif di sini jika card ada di bawah)
  {
    target: '#shortcut-card-overview', 
    content: 'Lihat ringkasan statistik dokumen Anda di sini.',
    placement: 'auto',
    // disableScroll: false, // Defaultnya false, jadi dia akan scroll otomatis jika card tidak terlihat
  },
  
  // ... langkah card lainnya (biarkan default agar bisa scroll ke bawah) ...
  {
    target: '#shortcut-card-documents', 
    content: 'Kelola file pribadi dan tanda tangan mandiri di menu ini.',
  },
  {
    target: '#shortcut-card-workspaces', 
    content: 'Kelola tim dan dokumen bersama di menu Workspace.',
  },
  {
    target: '#shortcut-card-history', 
    content: 'Pantau jejak audit (Audit Trail) lengkap.',
  },
  {
    target: '#shortcut-card-profile', 
    content: 'Atur preferensi akun Anda di sini.',
  },
];