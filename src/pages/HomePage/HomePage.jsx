import React from 'react';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import HowItWorksSection from './HowItWorksSection';
import StatisticSection from './StatisticSection'; // Pastikan nama file import sesuai

const HomePage = () => {
    return (
        <main className="w-full overflow-hidden bg-white dark:bg-slate-900 transition-colors duration-300">
            {/* 1. Hero Section (Pastikan file HeroSection Anda sudah update juga) */}
            <HeroSection />
            
            {/* 2. Features Section */}
            <FeaturesSection />
            
            {/* 3. How It Works Section */}
            <HowItWorksSection />
            
            {/* 4. Statistic / Impact Section */}
            <StatisticSection />
        </main>
    );
};

export default HomePage;