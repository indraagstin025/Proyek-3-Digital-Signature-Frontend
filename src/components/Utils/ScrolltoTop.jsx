import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Komponen ini tidak merender UI apa pun.
 * Tugasnya hanya mendeteksi perubahan 'pathname' (URL)
 * dan melakukan scroll ke posisi (0, 0) alias paling atas.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]); // <--- Efek berjalan setiap kali 'pathname' berubah

  return null;
};

export default ScrollToTop;