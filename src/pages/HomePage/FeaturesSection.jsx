import React, { useEffect } from 'react';
import FeatureCard from '../../components/FeatureCard/FeatureCard'; 
import { FaShieldAlt, FaQrcode, FaUsers, FaCogs } from 'react-icons/fa';

const features = [
  {
    icon: <FaShieldAlt />,
    title: "Keamanan Berlapis",
    description: "Enkripsi end-to-end dan audit trail memastikan setiap dokumen aman dari manipulasi.",
    className: "md:col-span-2 lg:col-span-2",
    delay: 0,
  },
  {
    icon: <FaQrcode />,
    title: "Verifikasi QR Code",
    description: "Validasi keaslian dokumen secara instan hanya dengan memindai QR code unik.",
    delay: 100,
  },
  {
    icon: <FaUsers />,
    title: "Kolaborasi Tim",
    description: "Buat grup, tentukan peran, dan kelola alur kerja persetujuan dengan mudah.",
    delay: 200,
  },
  {
    icon: <FaCogs />,
    title: "Integrasi Penuh",
    description: "Hubungkan dengan sistem yang sudah ada melalui API modern kami untuk otomatisasi tanpa batas.",
    className: "md:col-span-3 lg:col-span-4",
    delay: 300,
  },
];

const FeaturesSection = () => {
  useEffect(() => {
    const elements = document.querySelectorAll('.scroll-animate');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.2 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <section id="features" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center scroll-animate">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Dirancang untuk Keamanan & Kemudahan
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Semua yang Anda butuhkan dalam satu platform terintegrasi.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="scroll-animate"
              style={{ transitionDelay: `${feature.delay}ms` }}
            >
              <FeatureCard {...feature} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
