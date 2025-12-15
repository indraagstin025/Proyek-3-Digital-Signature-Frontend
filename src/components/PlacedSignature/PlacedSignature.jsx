import React, { useEffect, useRef, useState } from "react";
import interact from "interactjs";
import { FaTimes } from "react-icons/fa";

// Konstanta Ukuran (Harus sesuai dengan CSS Padding)
const CSS_PADDING = 12;
const CSS_BORDER = 1;
const CONTENT_OFFSET = CSS_PADDING + CSS_BORDER; // 13px
const TOTAL_REDUCTION = CONTENT_OFFSET * 2; // 26px

const PlacedSignature = ({ signature, onUpdate, onDelete, readOnly = false, documentId }) => {
  const elementRef = useRef(null);

  
  const positionRef = useRef({
    x: signature.x_display || 0,
    y: signature.y_display || 0,
    w: signature.width_display || 0,
    h: signature.height_display || 0,
  });

  // State Interaction
  const [isActive, setIsActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  // -----------------------------------------------------------------------
  // INIT POSITION (Saat pertama kali load halaman)
  // -----------------------------------------------------------------------
  useEffect(() => {
    const element = elementRef.current;
    if (!element || !element.parentElement) return;

    const calculatePosition = () => {
      const parentRect = element.parentElement.getBoundingClientRect();
      if (parentRect.width < 50) return;

      const isMine = !readOnly;
      // Jika punya kita, sudah ada posisi di layar, dan sedang aktif -> Jangan reset
      if (isMine && positionRef.current.w > 0 && (isDragging || isResizing || isActive)) {
        return;
      }

      // Gunakan data props (dari DB) jika valid
      if (signature.positionX !== null && !isNaN(signature.positionX)) {
        const calculatedX = signature.positionX * parentRect.width - CONTENT_OFFSET;
        const calculatedY = signature.positionY * parentRect.height - CONTENT_OFFSET;
        const calculatedW = signature.width * parentRect.width + TOTAL_REDUCTION;
        const calculatedH = signature.height * parentRect.height + TOTAL_REDUCTION;

        positionRef.current = { x: calculatedX, y: calculatedY, w: calculatedW, h: calculatedH };
        element.style.transform = `translate(${calculatedX}px, ${calculatedY}px)`;
        element.style.width = `${calculatedW}px`;
        element.style.height = `${calculatedH}px`;
      }
    };

    const resizeObserver = new ResizeObserver(() => calculatePosition());
    resizeObserver.observe(element.parentElement);
    calculatePosition(); // Run once immediately

    return () => resizeObserver.disconnect();
  }, [
    signature.id,
    signature.positionX,
    signature.positionY,
    signature.width,
    signature.height,
    readOnly,
    isDragging,
    isResizing,
    isActive, // Dependencies
  ]);

  // -----------------------------------------------------------------------
  // HANDLE CLICK OUTSIDE
  // -----------------------------------------------------------------------
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (elementRef.current && !elementRef.current.contains(e.target)) {
        setIsActive(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // -----------------------------------------------------------------------
  // INTERACT.JS CONFIGURATION (Drag & Resize Lokal)
  // -----------------------------------------------------------------------
  useEffect(() => {
    const element = elementRef.current;
    if (!element || readOnly) return;

    const interactable = interact(element)
      .draggable({
        listeners: {
          start(event) {
            setIsDragging(true);
            setIsActive(true);
            event.target.style.cursor = "grabbing";
          },
          move(event) {
            // Update posisi ref lokal
            positionRef.current.x += event.dx;
            positionRef.current.y += event.dy;
            event.target.style.transform = `translate(${positionRef.current.x}px, ${positionRef.current.y}px)`;
          },
          end(event) {
            setIsDragging(false);
            event.target.style.cursor = "grab";

            // Update ke Parent React State (untuk save ke DB nanti)
            const parent = event.target.parentElement;
            if (!parent) return;
            const parentRect = parent.getBoundingClientRect();

            const realImageW = positionRef.current.w - TOTAL_REDUCTION;
            const realImageH = positionRef.current.h - TOTAL_REDUCTION;
            const realImageX = positionRef.current.x + CONTENT_OFFSET;
            const realImageY = positionRef.current.y + CONTENT_OFFSET;

            onUpdate({
              ...signature,
              x_display: positionRef.current.x,
              y_display: positionRef.current.y,
              width_display: positionRef.current.w,
              height_display: positionRef.current.h,
              positionX: realImageX / parentRect.width,
              positionY: realImageY / parentRect.height,
              width: realImageW / parentRect.width,
              height: realImageH / parentRect.height,
            });
          },
        },
        inertia: true,
        modifiers: [interact.modifiers.restrictRect({ restriction: "parent", endOnly: true })],
      })
      .resizable({
        edges: { left: true, right: true, bottom: true, top: true },
        listeners: {
          start() {
            setIsResizing(true);
          },
          move(event) {
            const { x: oldX, y: oldY, w: oldW, h: oldH } = positionRef.current;
            const { deltaRect, edges } = event;

            // Hitung ukuran baru
            let newWidth = oldW - (deltaRect.left || 0) + (deltaRect.right || 0);
            let newHeight = oldH - (deltaRect.top || 0) + (deltaRect.bottom || 0);
            newWidth = Math.max(newWidth, 80); // Min size outer
            newHeight = Math.max(newHeight, 50);

            // Maintain Aspect Ratio (jika ada)
            const imgRatio = parseFloat(event.target.dataset.ratio) || (oldW > TOTAL_REDUCTION && oldH > TOTAL_REDUCTION ? (oldW - TOTAL_REDUCTION) / (oldH - TOTAL_REDUCTION) : null);

            if (imgRatio) {
              let innerW = newWidth - TOTAL_REDUCTION;
              let innerH = newHeight - TOTAL_REDUCTION;
              if (edges.top || edges.bottom) {
                innerW = innerH * imgRatio;
              } else {
                innerH = innerW / imgRatio;
              }
              newWidth = innerW + TOTAL_REDUCTION;
              newHeight = innerH + TOTAL_REDUCTION;
            }

            // Adjust posisi jika resize dari kiri/atas
            let x = oldX;
            let y = oldY;
            if (edges.left) x = oldX + oldW - newWidth;
            if (edges.top) y = oldY + oldH - newHeight;

            // Apply ke DOM & Ref
            positionRef.current = { x, y, w: newWidth, h: newHeight };
            Object.assign(event.target.style, {
              width: `${newWidth}px`,
              height: `${newHeight}px`,
              transform: `translate(${x}px, ${y}px)`,
            });

            // Kirim Socket
            if (documentId) {
              const parent = event.target.parentElement;
              if (!parent) return;
              const parentRect = parent.getBoundingClientRect();
            }
          },
          end(event) {
            setIsResizing(false);
            const parent = event.target.parentElement;
            if (!parent) return;
            const parentRect = parent.getBoundingClientRect();

            const { x, y, w, h } = positionRef.current;
            const realImageW = w - TOTAL_REDUCTION;
            const realImageH = h - TOTAL_REDUCTION;
            const realImageX = x + CONTENT_OFFSET;
            const realImageY = y + CONTENT_OFFSET;

            onUpdate({
              ...signature,
              width_display: w,
              height_display: h,
              x_display: x,
              y_display: y,
              positionX: realImageX / parentRect.width,
              positionY: realImageY / parentRect.height,
              width: realImageW / parentRect.width,
              height: realImageH / parentRect.height,
            });
          },
        },
        modifiers: [interact.modifiers.restrictSize({ min: { width: 80, height: 50 } })],
      });

    return () => interactable.unset();
  }, [readOnly, signature.id, onUpdate, documentId]);

  // -----------------------------------------------------------------------
  // RENDER JSX
  // -----------------------------------------------------------------------
  const handleStyle = "absolute w-3 h-3 bg-white border border-blue-600 rounded-full z-[60] pointer-events-auto";

  // Style border dinamis
  let borderClass = "";
  if (isActive && !readOnly) borderClass = "border border-blue-500";
  else if (!readOnly) borderClass = "hover:border hover:border-blue-300 hover:border-dashed";

  return (
    <div
      ref={elementRef}
      data-ratio={signature.ratio || ""}
      className={`absolute select-none touch-none group flex flex-col ${isActive ? "z-50" : "z-10"}`}
      style={{
        left: 0,
        top: 0,
        // Gunakan posisi dari REF untuk render awal, selanjutnya dimanipulasi DOM
        transform: `translate(${positionRef.current.x}px, ${positionRef.current.y}px)`,
        // Transisi halus hanya jika bukan drag (agar responsif saat drag)
        transition: isDragging || isResizing ? "none" : "transform 0.1s linear",
        width: positionRef.current.w ? `${positionRef.current.w}px` : "auto",
        height: positionRef.current.h ? `${positionRef.current.h}px` : "auto",
        cursor: readOnly ? "default" : isDragging ? "grabbing" : "grab",
      }}
      data-id={signature.id}
      onMouseDown={(e) => {
        if (!readOnly) {
          e.stopPropagation();
          setIsActive(true);
        }
      }}
      onTouchStart={(e) => {
        if (!readOnly) {
          e.stopPropagation();
          setIsActive(true);
        }
      }}
    >
      <div style={{ padding: `${CSS_PADDING}px` }} className={`relative w-full h-full flex items-center justify-center transition-all duration-100 ${borderClass}`}>
        {/* Tombol Hapus (Hanya muncul jika aktif & milik sendiri) */}
        {isActive && !readOnly && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(signature.id);
            }}
            className="absolute -top-3 -right-3 w-6 h-6 bg-blue-600 text-white rounded-md flex items-center justify-center shadow-sm hover:bg-blue-700 z-[70] pointer-events-auto"
            title="Hapus"
          >
            <FaTimes size={12} />
          </button>
        )}

        {/* Resize Handles */}
        {isActive && !readOnly && (
          <>
            <div className={`${handleStyle} -top-1.5 -left-1.5 cursor-nw-resize`}></div>
            <div className={`${handleStyle} -top-1.5 -right-1.5 cursor-ne-resize`}></div>
            <div className={`${handleStyle} -bottom-1.5 -left-1.5 cursor-sw-resize`}></div>
            <div className={`${handleStyle} -bottom-1.5 -right-1.5 cursor-se-resize`}></div>
          </>
        )}

        {/* Konten Gambar Tanda Tangan */}
        <div className={`w-full h-full relative overflow-hidden transition-colors duration-200 ${isActive && !readOnly ? "border-red-400 border" : "border-transparent"}`}>
          {signature.signatureImageUrl ? (
            <img
              src={signature.signatureImageUrl}
              alt="Signature"
              style={{ imageRendering: "high-quality", WebkitFontSmoothing: "antialiased" }}
              className="w-full h-full object-contain pointer-events-none select-none"
              // Handler onLoad untuk set rasio awal (sama seperti kode lama)
              onLoad={(e) => {
                const hasDbSize = signature.width && signature.width > 0;
                const hasDisplaySize = positionRef.current.w > 0;
                if (hasDbSize || hasDisplaySize) return;

                const parentRect = elementRef.current?.parentElement?.getBoundingClientRect();
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

                positionRef.current.w = finalDisplayW;
                positionRef.current.h = finalDisplayH;

                elementRef.current.style.width = `${finalDisplayW}px`;
                elementRef.current.style.height = `${finalDisplayH}px`;

                if (!readOnly) {
                  const realX = positionRef.current.x + CONTENT_OFFSET;
                  const realY = positionRef.current.y + CONTENT_OFFSET;
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
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-yellow-100/50 border-2 border-dashed border-yellow-500 text-yellow-700 rounded">
              <span className="text-xs font-bold text-center px-1">Sign Here</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlacedSignature;
