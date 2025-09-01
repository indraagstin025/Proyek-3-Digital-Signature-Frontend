import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

const MainLayout = () => {
  return (
    // PERUBAHAN: Ganti 'bg-gray-950' dengan kelas gradasi
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-gray-300"> 
      <Header />
      <main className="flex-grow pt-20"> 
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;