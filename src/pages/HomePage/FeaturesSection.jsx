import React, { useEffect } from 'react';
// Kita buat card langsung di sini agar style-nya lebih fleksibel dan terjamin bagus
import { FaShieldAlt, FaQrcode, FaUsers, FaCogs } from 'react-icons/fa';

const features = [
  {
    icon: <FaShieldAlt />,
    title: "Keamanan Berlapis",
    description: "Enkripsi end-to-end (E2EE) dan audit trail memastikan setiap dokumen aman dari manipulasi pihak tidak bertanggung jawab.",
    delay: 0,
  },
  {
    icon: <FaQrcode />,
    title: "Verifikasi QR Code",
    description: "Validasi keaslian dokumen fisik maupun digital secara instan hanya dengan memindai QR code unik yang tertanam.",
    delay: 100,
  },
  {
    icon: <FaUsers />,
    title: "Kolaborasi Tim",
    description: "Buat grup penandatangan, tentukan peran (Signer/Viewer), dan kelola alur kerja persetujuan secara real-time.",
    delay: 200,
  },
  {
    icon: <FaCogs />,
    title: "Integrasi API",
    description: "Hubungkan WeSign dengan sistem ERP atau aplikasi internal Anda melalui API modern kami untuk otomatisasi penuh.",
    delay: 300,
  },
];

const FeaturesSection = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
            entry.target.classList.remove('opacity-0', 'translate-y-10');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.scroll-animate').forEach((el) => {
      el.classList.add('opacity-0', 'translate-y-10', 'transition-all', 'duration-700', 'ease-out');
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" className="py-24 relative overflow-hidden bg-white dark:bg-slate-900">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute top-[10%] right-[5%] w-72 h-72 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-[80px]"></div>
         <div className="absolute bottom-[10%] left-[5%] w-72 h-72 bg-indigo-100 dark:bg-indigo-900/20 rounded-full blur-[80px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center scroll-animate max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-bold tracking-wide text-blue-600 uppercase mb-2">Fitur Unggulan</h2>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 leading-tight">
            Dirancang untuk <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Keamanan & Kecepatan</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Platform all-in-one untuk kebutuhan legalitas digital Anda tanpa kompromi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="scroll-animate group p-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 transform hover:-translate-y-2"
              style={{ transitionDelay: `${feature.delay}ms` }}
            >
              <div className="w-14 h-14 rounded-xl bg-blue-50 dark:bg-slate-700 flex items-center justify-center text-2xl text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;