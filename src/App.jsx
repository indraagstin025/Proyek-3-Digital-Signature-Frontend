import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Header from './components/Header/Header.jsx';
import MainLayout from './components/MainLayout/MainLayout.jsx';
import HomePage from './pages/HomePage/HomePage.jsx';
import LoginPage from './pages/LoginPage/LoginPage.jsx';
import RegisterPage from "./pages/RegisterPage/RegisterPage.jsx";
import ForgotPasswordPage from './pages/ForgotPasswordPage/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage/ResetPasswordPage.jsx';
import DashboardPage from "./pages/DashboardPage/DashboardPage.jsx";

function App() {
  // Ambil tema dari localStorage, fallback ke "light"
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'light'
  );

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <Router>
      {/* Jangan pakai dark:bg disini, styling global pindah ke index.css */}
      <div className="min-h-screen">
        <div className="aurora-bg"></div> 

        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            style: {
              background: theme === 'dark' ? '#1F2937' : '#FFFFFF',
              color: theme === 'dark' ? '#D1D5DB' : '#111827',
              border: theme === 'dark'
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid #E5E7EB',
            },
            error: {
              iconTheme: {
                primary: '#F87171',
                secondary: theme === 'dark' ? '#1F2937' : '#FFFFFF',
              },
            },
            success: {
              iconTheme: {
                primary: '#34D399',
                secondary: theme === 'dark' ? '#1F2937' : '#FFFFFF',
              }
            }
          }}
        />

        {/* Header kirim props theme & toggle */}
        <Header theme={theme} toggleTheme={toggleTheme} />

        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>
          
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
