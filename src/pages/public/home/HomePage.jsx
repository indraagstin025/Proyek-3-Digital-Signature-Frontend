import React, { useEffect } from 'react';
import HeroSection from './section/HeroSection.jsx';
import FeaturesSection from './section/FeaturesSection.jsx';
import HowItWorksSection from './section/HowItWorksSection.jsx';
import TestimonialsSection from './section/StatisticSection.jsx';

const HomePage = () => {
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        const elements = document.querySelectorAll('.scroll-animate');
        elements.forEach(el => observer.observe(el));

        return () => {
            elements.forEach(el => observer.unobserve(el));
        };
    }, []);

    return (
        <main>
            <HeroSection />
            <FeaturesSection />
            <HowItWorksSection />
            <TestimonialsSection />
        </main>
    );
};

export default HomePage;