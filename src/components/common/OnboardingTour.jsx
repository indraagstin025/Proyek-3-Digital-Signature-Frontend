import React, { useState, useEffect } from "react";
import Joyride, { STATUS, EVENTS } from "react-joyride";
import { userService } from "../../services/userService";

const OnboardingTour = ({ tourKey, steps, onOpenSidebar }) => {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const checkTourStatus = async () => {
      // [1] CEK LOCALSTORAGE (Pengecekan Instan)
      // Jika di browser ini sudah ditandai selesai, jangan jalankan lagi.
      // Ini mencegah tour muncul sesaat sebelum data API dimuat.
      const localStatus = localStorage.getItem(`tour_done_${tourKey}`);
      if (localStatus === "true") {
        setRun(false);
        return;
      }

      // [2] CEK DATABASE (Validasi Server)
      // Jika di LocalStorage belum ada, baru kita cek ke server untuk memastikan.
      try {
        const user = await userService.getMyProfile();
        if (user) {
          const progress = user.tourProgress || {};
          
          // Jika di database sudah true, tapi di local belum, sinkronkan local
          if (progress[tourKey]) {
            localStorage.setItem(`tour_done_${tourKey}`, "true");
            setRun(false);
          } else {
            // Jika di database juga belum, baru jalankan Tour
            setRun(true);
          }
        }
      } catch (error) {
        console.error("Gagal cek tour:", error);
      }
    };

    checkTourStatus();
  }, [tourKey]);

  const handleJoyrideCallback = async (data) => {
    const { status, type, step } = data;

    // Logika Sidebar Mobile (Tetap Sama)
    if (type === EVENTS.STEP_BEFORE) {
      if (typeof step.target === 'string' && step.target.includes('#sidebar-')) {
        if (onOpenSidebar) {
          onOpenSidebar();
          setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
          }, 350);
        }
      }
    }

    // [3] SIMPAN STATUS SAAT SELESAI
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false); // Stop UI Tour

      // A. Simpan ke LocalStorage (Agar refresh instan aman)
      localStorage.setItem(`tour_done_${tourKey}`, "true");

      // B. Simpan ke Database (Agar tersimpan permanen di akun)
      try {
        await userService.updateTourProgress(tourKey);
      } catch (e) {
        console.error("Gagal update tour progress di server", e);
      }
    }
  };

  if (!run) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}
      showProgress={true}
      showSkipButton={true}
      callback={handleJoyrideCallback}
      scrollToFirstStep={false}
      disableScrollParentFix={true}
      scrollOffset={100}

      // --- STYLING (Tetap Sama) ---
      styles={{
        options: {
          zIndex: 10000, 
          primaryColor: '#2563EB',
          overlayColor: 'rgba(15, 23, 42, 0.75)', 
          width: 420,
        },
        tooltip: {
          borderRadius: '24px',
          padding: '24px',
          backgroundColor: 'var(--tour-bg)',
          color: 'var(--tour-text)',
          boxShadow: 'var(--tour-shadow)',
          border: '1px solid var(--tour-border)',
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        tooltipTitle: {
          fontSize: '18px',
          fontWeight: '700',
          color: 'var(--tour-title)',
          marginBottom: '12px',
          fontFamily: 'inherit',
        },
        tooltipContent: {
          fontSize: '15px',
          color: 'var(--tour-text)',
          lineHeight: '1.6',
          fontFamily: 'inherit',
        },
        buttonNext: {
          background: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)',
          borderRadius: '12px',
          border: 'none',
          color: '#ffffff',
          fontSize: '14px',
          fontWeight: '600',
          padding: '12px 24px',
          outline: 'none',
          boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)',
          cursor: 'pointer',
        },
        buttonBack: {
          color: 'var(--tour-btn-text)',
          fontSize: '14px',
          fontWeight: '600',
          marginRight: '16px',
        },
        buttonSkip: {
          color: 'var(--tour-btn-text)',
          fontSize: '14px',
          fontWeight: '500',
        }
      }}
      
      locale={{
        back: 'Kembali', close: 'Tutup', last: 'Selesai!', next: 'Lanjut →', skip: 'Lewati',
      }}
    />
  );
};

export default OnboardingTour;