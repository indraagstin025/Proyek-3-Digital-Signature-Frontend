import React from 'react';

const Header = ({ navigate }) => {
  return (
    <header className="bg-gray-900/70 backdrop-blur-sm fixed top-0 left-0 right-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
        <a href="#" className="text-2xl font-bold text-white">DigiSign.</a>
        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="font-medium text-gray-300 hover:text-white transition-colors">Fitur</a>
          <a href="#how-it-works" className="font-medium text-gray-300 hover:text-white transition-colors">Proses</a>
          <a href="#testimonials" className="font-medium text-gray-300 hover:text-white transition-colors">Testimoni</a>
        </div>
        <div className="hidden md:flex items-center space-x-4">
          <button onClick={() => navigate('/login')} className="bg-white/10 text-white font-semibold py-2 px-5 rounded-lg hover:bg-white/20 transition-colors">Login</button>
        </div>
        <button className="md:hidden text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
        </button>
      </nav>
      <div id="mobile-menu" className="hidden md:hidden bg-gray-900/90 backdrop-blur-lg"></div>
    </header>
  );
};

export default Header;