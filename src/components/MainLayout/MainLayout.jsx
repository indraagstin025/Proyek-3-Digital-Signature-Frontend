import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Footer from '../Footer/Footer';

const MainLayout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="relative flex flex-col min-h-screen text-gray-300 
                    bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 
                    dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 
                    overflow-hidden">

      {/* Aurora / Glow Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-green-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-blue-500/30 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Konten Utama */}
      <main className={`flex-grow ${isHomePage ? '' : 'pt-20'}`}>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;
