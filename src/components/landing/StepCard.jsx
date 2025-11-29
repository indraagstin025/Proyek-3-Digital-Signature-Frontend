import React from 'react';

const StepCard = ({ number, title, description, delay }) => {
    return (
        <div 
            className="flex flex-col sm:flex-row items-center gap-6 text-left scroll-animate"
            style={{ transitionDelay: `${delay || 0}ms` }}
        >
            {/* Sesuaikan warna lingkaran nomor untuk light & dark mode */}
            <div className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold
                        bg-blue-100 text-blue-600 border-2 border-blue-200
                        dark:bg-blue-600/20 dark:text-blue-400 dark:border-blue-500">
                {number}
            </div>
            <div>
                {/* Sesuaikan warna teks untuk light & dark mode */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
                <p className="mt-1 text-gray-600 dark:text-gray-400">{description}</p>
            </div>
        </div>
    );
};

export default StepCard;