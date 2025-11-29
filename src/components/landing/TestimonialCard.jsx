import React from 'react';

const TestimonialCard = ({ quote, name, title, delay }) => {
    return (
        <div 
            className="bento-card bg-gray-800/50 p-8 rounded-xl scroll-animate"
            style={{ transitionDelay: `${delay || 0}ms` }}
        >
            <p className="text-gray-300 leading-relaxed">"{quote}"</p>
            <div className="mt-6 flex items-center">
                <img className="w-12 h-12 rounded-full bg-gray-700 object-cover" src={`https://i.pravatar.cc/48?u=${name}`} alt={name} />
                <div className="ml-4">
                    <p className="font-bold text-white">{name}</p>
                    <p className="text-sm text-gray-400">{title}</p>
                </div>
            </div>
        </div>
    );
};

export default TestimonialCard;