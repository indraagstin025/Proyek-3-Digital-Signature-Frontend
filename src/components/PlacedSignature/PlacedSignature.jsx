import React, { useEffect, useRef, useState } from "react";
import interact from "interactjs";
import { FaTimes } from "react-icons/fa";

// --- KONFIGURASI PIXEL PERFECT ---
const CSS_PADDING = 12; 
const CSS_BORDER = 1;
const CONTENT_OFFSET = CSS_PADDING + CSS_BORDER; // 13px
const TOTAL_REDUCTION = CONTENT_OFFSET * 2;      // 26px

const PlacedSignature = ({ signature, onUpdate, onDelete }) => {
  const ref = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // [FIX BARU] STATE LOKAL UNTUK POSISI DISPLAY
  // Kita gunakan state lokal agar bisa update UI tanpa menunggu round-trip ke parent state
  const [localX, setLocalX] = useState(signature.x_display || 0);
  const [localY, setLocalY] = useState(signature.y_display || 0);
  const [localW, setLocalW] = useState(signature.width_display || 0);
  const [localH, setLocalH] = useState(signature.height_display || 0);

  // [FIX BARU] INIT POSISI DARI PERSENTASE (AI) KE PIXEL
  useEffect(() => {
    const element = ref.current;
    if (!element || !element.parentElement) return;

    const parentRect = element.parentElement.getBoundingClientRect();
    
    // Jika x_display/y_display masih 0 (baru dari AI), tapi positionX/Y ada isinya
    // Maka kita hitung pixelnya sekarang.
    if (signature.x_display === 0 && signature.positionX > 0) {
        // Rumus: (Persen * LebarParent) - Offset Padding
        const calculatedX = (signature.positionX * parentRect.width) - CONTENT_OFFSET;
        const calculatedY = (signature.positionY * parentRect.height) - CONTENT_OFFSET;
        
        const calculatedW = (signature.width * parentRect.width) + TOTAL_REDUCTION;
        const calculatedH = (signature.height * parentRect.height) + TOTAL_REDUCTION;

        setLocalX(calculatedX);
        setLocalY(calculatedY);
        setLocalW(calculatedW);
        setLocalH(calculatedH);

        // Update balik ke parent agar data sinkron
        onUpdate({
            ...signature,
            x_display: calculatedX,
            y_display: calculatedY,
            width_display: calculatedW,
            height_display: calculatedH
        });
    }
  }, [signature.id]); // Jalankan sekali saat komponen mount/ID berubah

  // Effect untuk handle klik luar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsActive(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    interact(element)
      .draggable({
        listeners: {
          start(event) {
            setIsDragging(true);
            setIsActive(true);
            event.target.style.cursor = "grabbing";
          },
          move(event) {
            // Gunakan state lokal untuk performa drag yang smooth
            setLocalX((prev) => prev + event.dx);
            setLocalY((prev) => prev + event.dy);
          },
          end(event) {
            setIsDragging(false);
            event.target.style.cursor = "grab";

            const parentRect = event.target.parentElement.getBoundingClientRect();
            
            // Ambil nilai akhir dari state lokal
            // Kita butuh akses nilai terbaru, karena state di dalam closure event listener mungkin stale,
            // kita baca dari atribut data-x/y yang diupdate manual atau gunakan logic ref.
            // Tapi cara paling aman di interactjs adalah hitung delta total.
            
            // Simplifikasi: Baca current transform dari DOM atau hitung ulang
            // Cara terbaik: passing nilai calculated ke onUpdate
            
            // Kita hitung ulang based on event target position (interactjs keeps track)
            const target = event.target;
            // Parsing transform manually is hard, so we rely on our managed state logic correction below:
            
            // FIX: InteractJS move listener updates local state.
            // We need to pass THAT final local state to onUpdate.
            // Since accessing state inside this closure is tricky, we rely on reading DOM attributes if we sync them,
            // OR we recalculate based on `signature.x_display + totalDelta`.
            
            // Let's stick to the reading data-attributes pattern which works reliably
            const x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx; 
            const y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;
            
            // Re-calculate DB Data
            const realImageX = x + CONTENT_OFFSET;
            const realImageY = y + CONTENT_OFFSET;

            onUpdate({
              ...signature,
              x_display: x,
              y_display: y,
              positionX: realImageX / parentRect.width,
              positionY: realImageY / parentRect.height,
            });
          },
        },
        inertia: true,
        modifiers: [
          interact.modifiers.restrictRect({
            restriction: "parent",
            endOnly: true,
          }),
        ],
      })
      .resizable({
        edges: { left: true, right: true, bottom: true, top: true },
        listeners: {
          move(event) {
            const target = event.target;
            let newX = parseFloat(target.getAttribute("data-x")) || 0;
            let newY = parseFloat(target.getAttribute("data-y")) || 0;

            const imgRatio = parseFloat(target.dataset.ratio);
            let newWidth = event.rect.width;
            let newHeight = event.rect.height;

            if (imgRatio) {
                const innerWidth = newWidth - TOTAL_REDUCTION;
                const idealInnerHeight = innerWidth / imgRatio; 
                newHeight = idealInnerHeight + TOTAL_REDUCTION;
            }

            newX += event.deltaRect.left;
            newY += event.deltaRect.top;

            // Update Local State Visual
            setLocalW(newWidth);
            setLocalH(newHeight);
            setLocalX(newX);
            setLocalY(newY);
          },
          end(event) {
            const parentRect = event.target.parentElement.getBoundingClientRect();
            // Baca nilai akhir dari local state (yang tersinkron dengan DOM attribute di render)
            // Di sini kita ambil dari event.rect dan posisi akhir
            
            // Karena logika resize interactjs kompleks, kita ambil final rect
            // Note: kita harus hati-hati dengan x/y yang berubah saat resize left/top
            
            // Kita ambil dari DOM attributes yang diset di render loop
            const target = event.target;
            const finalX = parseFloat(target.getAttribute("data-x"));
            const finalY = parseFloat(target.getAttribute("data-y"));
            const finalW = parseFloat(target.style.width);
            const finalH = parseFloat(target.style.height);

            const realImageX = finalX + CONTENT_OFFSET;
            const realImageY = finalY + CONTENT_OFFSET;
            const realImageW = finalW - TOTAL_REDUCTION;
            const realImageH = finalH - TOTAL_REDUCTION;

            onUpdate({
              ...signature,
              width_display: finalW,
              height_display: finalH,
              x_display: finalX,
              y_display: finalY,
              
              positionX: realImageX / parentRect.width,
              positionY: realImageY / parentRect.height,
              width: realImageW / parentRect.width,
              height: realImageH / parentRect.height,
            });
          },
        },
        modifiers: [
          interact.modifiers.restrictSize({
            min: { width: 80, height: 50 },
          }),
        ],
      });

    return () => interact(element).unset();
  }, [signature, onUpdate]);

  // Sync Prop changes to Local State (Penting saat undo/redo atau external update)
  useEffect(() => {
      if (signature.x_display !== 0) {
          setLocalX(signature.x_display);
          setLocalY(signature.y_display);
          setLocalW(signature.width_display);
          setLocalH(signature.height_display);
      }
  }, [signature.x_display, signature.y_display, signature.width_display, signature.height_display]);


  const handleStyle = "absolute w-3 h-3 bg-white border border-blue-600 rounded-full z-30";

  return (
    <div
      ref={ref}
      data-ratio={signature.ratio || ""}
      // PENTING: Gunakan atribut data-x/y agar interactjs bisa baca posisi terakhir saat start drag
      data-x={localX} 
      data-y={localY}
      
      className={`absolute select-none touch-none group flex flex-col ${
        isActive ? "z-50" : "z-10"
      }`}
      style={{
        left: 0,
        top: 0,
        // Gunakan Local State untuk render
        transform: `translate(${localX}px, ${localY}px)`,
        width: localW ? `${localW}px` : "auto",
        height: localH ? `${localH}px` : "auto",
        cursor: isDragging ? "grabbing" : "grab",
      }}
      data-id={signature.id}
      onMouseDown={() => setIsActive(true)}
      onTouchStart={() => setIsActive(true)}
    >
      <div
        style={{ padding: `${CSS_PADDING}px` }}
        className={`relative w-full h-full flex items-center justify-center transition-all duration-100 ${
          isActive ? "border border-blue-500" : "hover:border hover:border-blue-300 hover:border-dashed"
        }`}
      >
        {isActive && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(signature.id);
            }}
            className="absolute -top-3 -right-3 w-6 h-6 bg-blue-600 text-white rounded-md flex items-center justify-center shadow-sm hover:bg-blue-700 z-40"
            title="Hapus"
          >
            <FaTimes size={12} />
          </button>
        )}

        {isActive && (
          <>
            <div className={`${handleStyle} -top-1.5 -left-1.5 cursor-nw-resize`}></div>
            <div className={`${handleStyle} -top-1.5 -right-1.5 cursor-ne-resize`}></div>
            <div className={`${handleStyle} -bottom-1.5 -left-1.5 cursor-sw-resize`}></div>
            <div className={`${handleStyle} -bottom-1.5 -right-1.5 cursor-se-resize`}></div>
          </>
        )}

        <div
          className={`w-full h-full border relative overflow-hidden transition-colors duration-200 ${
            isActive ? "border-red-400" : "border-transparent group-hover:border-red-400"
          }`}
        >
          {signature.signatureImageUrl ? (
            <img
              src={signature.signatureImageUrl}
              alt="Signature"
              className="w-full h-full object-contain pointer-events-none select-none"
              onLoad={(e) => {
                // Logika OnLoad (hanya jalankan jika belum ada dimensi)
                if (localW > 0) return; 

                const parentRect = ref.current?.parentElement?.getBoundingClientRect();
                if (!parentRect) return;

                const naturalWidth = e.target.naturalWidth;
                const naturalHeight = e.target.naturalHeight;
                const aspectRatio = naturalWidth / naturalHeight;

                const defaultWidthDisplay = Math.max(parentRect.width * 0.2, 150);
                const defaultHeightDisplay = defaultWidthDisplay / aspectRatio; 
                
                const innerW = defaultWidthDisplay - TOTAL_REDUCTION;
                const innerH = innerW / aspectRatio; 
                
                const finalDisplayW = innerW + TOTAL_REDUCTION;
                const finalDisplayH = innerH + TOTAL_REDUCTION;

                // Update Local
                setLocalW(finalDisplayW);
                setLocalH(finalDisplayH);

                // Sync Parent
                const realX = localX + CONTENT_OFFSET;
                const realY = localY + CONTENT_OFFSET;

                onUpdate({
                  ...signature,
                  width_display: finalDisplayW,
                  height_display: finalDisplayH,
                  ratio: aspectRatio,
                  width: innerW / parentRect.width,
                  height: innerH / parentRect.height,
                  positionX: realX / parentRect.width,
                  positionY: realY / parentRect.height,
                });
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-yellow-100/50 border-2 border-dashed border-yellow-500 text-yellow-700 rounded">
               <span className="text-xs font-bold text-center px-1">Sign Here</span>
               <span className="text-[10px] opacity-75">(AI Detected)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlacedSignature;