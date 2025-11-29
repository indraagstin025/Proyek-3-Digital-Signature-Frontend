import React, { useEffect } from 'react';
import StepCard from '../../../../components/landing/StepCard.jsx';

const steps = [
  {
    number: 1,
    title: "Unggah & Atur Dokumen",
    description: "Upload file PDF Anda, lalu tentukan urutan dan peran setiap penandatangan, seperti 'Kaprodi' atau 'Pembimbing'.",
    delay: 0,
  },
  {
    number: 2,
    title: "Tanda Tangan Digital",
    description: "Penandatangan akan menerima notifikasi untuk memberikan tanda tangan, baik melalui goresan langsung (canvas) maupun metode lain.",
    delay: 150,
  },
  {
    number: 3,
    title: "Verifikasi & Arsipkan",
    description: "Setelah lengkap, dokumen disegel secara kriptografis. Verifikasi keasliannya kapan saja dan arsipkan secara digital.",
    delay: 300,
  },
];

const HowItWorksSection = () => {
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
    <section id="how-it-works" className="py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="scroll-animate">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Proses yang Disederhanakan
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Dari unggah hingga arsip, semuanya hanya dalam beberapa klik.
          </p>
        </div>
        <div className="mt-16 space-y-12">
          {steps.map((step) => (
            <div
              key={step.number}
              className="scroll-animate"
              style={{ transitionDelay: `${step.delay}ms` }}
            >
              <StepCard {...step} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
