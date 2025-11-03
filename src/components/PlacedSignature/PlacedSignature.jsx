import React, { useEffect, useRef, useState } from "react";
import interact from "interactjs";
import { FaTrash, FaArrowsAlt, FaRegCopy } from "react-icons/fa";

const PlacedSignature = ({ signature, onUpdate, onDelete, onDuplicate }) => {
  const ref = useRef(null);
  const [isActive, setIsActive] = useState(false);

  // --- 1. LOGIKA HANDLE KLIK DI LUAR (Disesuaikan) ---
  useEffect(() => {
    // Listener ini dipasang pada DOM (document) yang merupakan solusi paling umum,
    // tetapi bisa terblokir oleh overlay dengan z-index tinggi atau pointer-events: none.
    const handleClickOutside = (e) => {
        // PENTING: Jika event target adalah salah satu handle resize, jangan hilangkan border
        if (e.target.closest(".handle-resize") || e.target.closest(".field-toolbar")) {
            return; 
        }

        // Jika kita tidak mengklik elemen signature itu sendiri
        if (ref.current && !ref.current.contains(e.target)) {
            setIsActive(false);
        }
    };
    
    // Pasang listener pada document
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // --- 2. LOGIKA INTERACTJS (DRAG & RESIZE) ---
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    interact(element)
      .draggable({
        // Mengabaikan sentuhan pada handle dan toolbar agar drag tidak terpicu
        ignoreFrom: ".field-toolbar, .handle-resize",

        listeners: {
          start(event) {
            event.target.style.cursor = "grabbing";
            event.target.style.willChange = "transform";
            event.target.classList.add('is-dragging'); 
          },
          move(event) {
            const target = event.target;
            const x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
            const y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;
            target.style.transform = `translate3d(${x}px, ${y}px, 0)`; 
            target.setAttribute("data-x", x);
            target.setAttribute("data-y", y);
          },
          end(event) {
            event.target.style.cursor = "grab";
            event.target.style.willChange = "auto";
            event.target.classList.remove('is-dragging'); 
            const parentRect = event.target.parentElement.getBoundingClientRect();
            const newX = parseFloat(event.target.getAttribute("data-x")) || 0;
            const newY = parseFloat(event.target.getAttribute("data-y")) || 0;
            onUpdate({
              ...signature,
              x_display: newX,
              y_display: newY,
              positionX: newX / parentRect.width,
              positionY: newY / parentRect.height,
            });
          },
        },
        inertia: true,
        autoScroll: true,
        modifiers: [interact.modifiers.restrictRect({ restriction: "parent" })],
      })

      .resizable({
        // Aktifkan edges sebagai petunjuk untuk InteractJS
        edges: { left: true, right: true, bottom: true, top: true },

        // Membatasi resize hanya dari handle dengan atribut data (CRITICAL)
        allowFrom: "[data-interact-resize]",

        listeners: {
          move(event) {
            const target = event.target;
            let x = parseFloat(target.getAttribute("data-x")) || 0;
            let y = parseFloat(target.getAttribute("data-y")) || 0;

            target.style.width = `${event.rect.width}px`;
            target.style.height = `${event.rect.height}px`;
            x += event.deltaRect.left;
            y += event.deltaRect.top;

            target.style.transform = `translate(${x}px, ${y}px)`;
            target.setAttribute("data-x", x);
            target.setAttribute("data-y", y);
          },
          end(event) {
            const parentRect = event.target.parentElement.getBoundingClientRect();
            const newX = parseFloat(event.target.getAttribute("data-x")) || 0;
            const newY = parseFloat(event.target.getAttribute("data-y")) || 0;

            onUpdate({
              ...signature,
              x_display: newX,
              y_display: newY,
              width_display: event.rect.width,
              height_display: event.rect.height,
              positionX: newX / parentRect.width,
              positionY: newY / parentRect.height,
              width: event.rect.width / parentRect.width,
              height: event.rect.height / parentRect.height,
            });
          },
        },
        modifiers: [interact.modifiers.aspectRatio({ ratio: "preserve" }), interact.modifiers.restrictSize({ min: { width: 50, height: 30 } })],
        inertia: true,
      });

    return () => interact(element).unset();
  }, [signature, onUpdate]);


  // --- 3. RENDER KOMPONEN ---
  return (
    <div
      ref={ref}
      className={`placed-field absolute z-10 select-none ${isActive ? "active-field" : ""}`}
      data-id={signature.id}
      style={{
        left: 0,
        top: 0,
        transform: `translate(${signature.x_display}px, ${signature.y_display}px)`,
        width: signature.width_display ? `${signature.width_display}px` : "auto",
        height: signature.height_display ? `${signature.height_display}px` : "auto",
      }}
      data-x={signature.x_display}
      data-y={signature.y_display}
      // Kita tetap menggunakan onClick untuk mengaktifkan border ketika diklik.
      onClick={() => setIsActive(true)}
    >
      <div
        className={`relative 
  ${isActive ? "border-2 border-dashed border-blue-500 rounded-lg" : ""}`}
        style={{
          width: "100%",
          height: "100%",
          background: 'transparent',
        }}
      >
        <img
          src={signature.signatureImageUrl}
          alt="Tanda Tangan"
          className="object-contain pointer-events-none w-full h-full select-none"
          // Logic onLoad image tetap di sini
        />
        
        {/* HANDLE RESIZE: Elemen <span> yang besar sebagai area sentuh */}
        {isActive && (
          <>
            <span className="handle-resize top-left" data-interact-resize="top, left" />
            <span className="handle-resize top-right" data-interact-resize="top, right" />
            <span className="handle-resize bottom-left" data-interact-resize="bottom, left" />
            <span className="handle-resize bottom-right" data-interact-resize="bottom, right" />
          </>
        )}

        {/* TOOLBAR: Menggunakan posisi absolut yang diatur oleh CSS (.field-toolbar) */}
        {isActive && (
          <div className="field-toolbar absolute flex items-center gap-1 bg-slate-800 rounded-md p-1 shadow-md">
            <button 
                onClick={onDuplicate ? () => onDuplicate(signature) : undefined}
                className="p-1 text-white hover:bg-slate-700 rounded" 
                title="Duplikasi"
            >
              <FaRegCopy size={12} />
            </button>
            <button className="p-1 text-white hover:bg-slate-700 rounded cursor-move" title="Geser">
              <FaArrowsAlt size={12} />
            </button>
            <button onClick={() => onDelete(signature.id)} className="p-1 text-white bg-red-600 hover:bg-red-700 rounded" title="Hapus">
              <FaTrash size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlacedSignature;