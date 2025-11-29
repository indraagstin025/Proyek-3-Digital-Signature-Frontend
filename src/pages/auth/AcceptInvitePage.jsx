// File: AcceptInvitePage.jsx
// (Versi Sederhana - Hanya "Gerbang")

import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const AcceptInvitePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      // 1. Simpan token di localStorage agar 'DashboardPage' bisa membacanya
      localStorage.setItem('pendingInviteToken', token);
      
      // 2. Arahkan user ke dashboard.
      // Jika user belum login, 'authMiddleware' Anda akan
      // secara otomatis mengarahkan mereka ke /login.
      // Setelah login, mereka akan mendarat di /dashboard.
      navigate('/dashboard', { replace: true });
    } else {
      // Jika tidak ada token, kirim ke login
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  // Halaman ini tidak perlu menampilkan apa-apa,
  // hanya 'loading' singkat selagi mengarahkan.
  return null; 
};

export default AcceptInvitePage;