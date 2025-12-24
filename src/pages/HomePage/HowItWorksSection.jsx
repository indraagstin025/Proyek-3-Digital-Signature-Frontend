import React, { useEffect } from 'react';

const steps = [
  {
    number: "01",
    title: "Unggah Dokumen",
    description: "Upload PDF Anda. Sistem otomatis mendeteksi area tanda tangan atau Anda bisa atur manual secara drag & drop.",
  },
  {
    number: "02",
    title: "Undang Penandatangan",
    description: "Tambahkan email para pihak. Atur urutan penandatanganan (sekuensial) atau paralel sesuai kebutuhan.",
  },
  {
    number: "03",
    title: "Selesai & Terverifikasi",
    description: "Semua pihak tanda tangan. Dokumen disegel kriptografi dan sertifikat audit trail diterbitkan otomatis.",
  },
];

const HowItWorksSection = () => {
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
      { threshold: 0.2 }
    );

    document.querySelectorAll('.scroll-animate').forEach((el) => {
      el.classList.add('opacity-0', 'translate-y-10', 'transition-all', 'duration-700', 'ease-out');
      observer.observe(el);
    });
    
    return () => observer.disconnect();
  }, []);

  return (
    <section id="how-it-works" className="py-24 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center scroll-animate mb-16">
           <h2 className="text-sm font-bold tracking-wide text-indigo-600 uppercase mb-2">Cara Kerja</h2>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
            Proses Simpel dalam <span className="text-indigo-600">3 Langkah</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
          {/* Garis penghubung (Hanya tampil di Desktop) */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent z-0"></div>

          {steps.map((step, index) => (
            <div
              key={index}
              className="scroll-animate relative z-10 flex flex-col items-center text-center"
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              {/* Number Bubble */}
              <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-800 border-4 border-slate-100 dark:border-slate-700 flex items-center justify-center mb-6 shadow-xl relative group hover:border-indigo-500 transition-colors duration-300">
                 <span className="text-3xl font-black text-slate-200 dark:text-slate-600 group-hover:text-indigo-600 transition-colors duration-300">
                    {step.number}
                 </span>
                 {/* Dot indicator */}
                 <div className="absolute -bottom-2 w-4 h-4 bg-indigo-600 rounded-full border-2 border-white dark:border-slate-800"></div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                {step.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;