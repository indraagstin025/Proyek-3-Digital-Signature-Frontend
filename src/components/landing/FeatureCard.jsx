import React from 'react';

const FeatureCard = ({ icon, title, description, className, delay }) => {
    return (
        <div 
            // Ganti warna latar belakang dan border untuk light & dark mode
            className={`bento-card p-6 sm:p-8 rounded-xl scroll-animate 
                        bg-gray-50 border border-gray-200/50
                        dark:bg-gray-800/50 dark:border-transparent ${className}`}
            style={{ transitionDelay: `${delay || 0}ms` }}
        >
            <div className="text-blue-500 dark:text-blue-400 mb-4 text-4xl">{icon}</div>
            {/* Ganti warna teks untuk light & dark mode */}
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{title}</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{description}</p>
        </div>
    );
};

export default FeatureCard;