import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import MainLayout from './components/MainLayout/MainLayout.jsx';
import HomePage from './pages/HomePage/HomePage.jsx';
import LoginPage from './pages/LoginPage/LoginPage.jsx';
import RegisterPage from "./pages/RegisterPage/RegisterPage.jsx";
import ForgotPasswordPage from './pages/ForgotPasswordPage/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage/ResetPasswordPage.jsx';
import DashboardPage from "./pages/DashboardPage/DashboardPage.jsx";

function App() {
    return (
        <Router>
            <div className="bg-gray-950 text-gray-300">
                <div className="aurora-bg"></div> 
                
                <Routes>
                    {/* Grup Rute yang menggunakan MainLayout */}
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<HomePage />} />
                        {/* Pindahkan rute login dan register ke dalam grup ini */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/reset-password" element={<ResetPasswordPage />} />
                    </Route>

                    {/* Rute untuk Dashboard tetap terpisah karena punya layout sendiri */}
                    <Route path="/dashboard" element={<DashboardPage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;