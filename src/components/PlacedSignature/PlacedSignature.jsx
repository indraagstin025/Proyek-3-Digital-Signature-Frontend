// file: src/components/PlacedSignature/PlacedSignature.jsx

import React, { useEffect, useRef, useState } from "react";
import interact from "interactjs";
import { FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const CSS_PADDING = 12;
const CSS_BORDER = 1;
const CONTENT_OFFSET = CSS_PADDING + CSS_BORDER;
const TOTAL_REDUCTION = CONTENT_OFFSET * 2;

const PlacedSignature = ({ signature, onUpdate, onDelete, readOnly = false, documentId, totalPages = 1, isSelected = false, onSelect = () => {} }) => {
  const elementRef = useRef(null);

  const propsRef = useRef({ onUpdate, onSelect, onDelete, signature, totalPages });
  useEffect(() => {
    propsRef.current = { onUpdate, onSelect, onDelete, signature, totalPages };
  }, [onUpdate, onSelect, onDelete, signature, totalPages]);

  const positionRef = useRef({
    x: signature.x_display || 0,
    y: signature.y_display || 0,
    w: signature.width_display || 0,
    h: signature.height_display || 0,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const isActive = isSelected || isDragging || isResizing;

  // --- INIT POSITION (WAJIB PIXEL PRIORITY) ---
  useEffect(() => {
    const element = elementRef.current;
    if (!element || !element.parentElement) return;

    const calculatePosition = () => {
      const parentRect = element.parentElement.getBoundingClientRect();
      if (parentRect.width < 50) return;

      const isMine = !readOnly;
      if (isMine && positionRef.current.w > 0 && (isDragging || isResizing)) {
        return;
      }

      // Gunakan data pixel (x_display) agar sinkron dengan Marquee
      if (signature.x_display != null && signature.y_display != null && signature.width_display != null && signature.height_display != null) {
        positionRef.current = {
          x: signature.x_display,
          y: signature.y_display,
          w: signature.width_display,
          h: signature.height_display,
        };

        element.style.transform = `translate(${signature.x_display}px, ${signature.y_display}px)`;
        element.style.width = `${signature.width_display}px`;
        element.style.height = `${signature.height_display}px`;
      }
      // Fallback ke persen (untuk data legacy)
      else if (signature.positionX !== null && !isNaN(signature.positionX)) {
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
    calculatePosition();

    return () => resizeObserver.disconnect();
  }, [signature.x_display, signature.y_display, signature.width_display, signature.height_display, signature.id, signature.positionX, signature.positionY, signature.width, signature.height, readOnly, isDragging, isResizing]);

  // --- INTERACT.JS SETUP ---
  useEffect(() => {
    const element = elementRef.current;
    if (!element || readOnly) return;

    const interactable = interact(element)
      .draggable({
        listeners: {
          start(event) {
            setIsDragging(true);
            propsRef.current.onSelect(propsRef.current.signature.id, event.shiftKey);
            event.target.style.cursor = "grabbing";
          },
          move(event) {
            positionRef.current.x += event.dx;
            positionRef.current.y += event.dy;
            event.target.style.transform = `translate(${positionRef.current.x}px, ${positionRef.current.y}px)`;
          },
          end(event) {
            setIsDragging(false);
            event.target.style.cursor = "grab";
            const parent = event.target.parentElement;
            if (!parent) return;
            const parentRect = parent.getBoundingClientRect();
            const realImageW = positionRef.current.w - TOTAL_REDUCTION;
            const realImageH = positionRef.current.h - TOTAL_REDUCTION;
            const realImageX = positionRef.current.x + CONTENT_OFFSET;
            const realImageY = positionRef.current.y + CONTENT_OFFSET;

            propsRef.current.onUpdate({
              ...propsRef.current.signature,
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
        modifiers: [interact.modifiers.restrictRect({ restriction: "parent", endOnly: false })],
      })
      .resizable({
        edges: { left: true, right: true, bottom: true, top: true },
        listeners: {
          start(event) {
            setIsResizing(true);
            propsRef.current.onSelect(propsRef.current.signature.id, event.shiftKey);
          },
          move(event) {
            const { x: oldX, y: oldY, w: oldW, h: oldH } = positionRef.current;
            const { deltaRect, edges } = event;
            let newWidth = oldW - (deltaRect.left || 0) + (deltaRect.right || 0);
            let newHeight = oldH - (deltaRect.top || 0) + (deltaRect.bottom || 0);
            newWidth = Math.max(newWidth, 80);
            newHeight = Math.max(newHeight, 50);

            const imgRatio = parseFloat(event.target.dataset.ratio) || (oldW > TOTAL_REDUCTION && oldH > TOTAL_REDUCTION ? (oldW - TOTAL_REDUCTION) / (oldH - TOTAL_REDUCTION) : null);
            if (imgRatio) {
              let innerW = newWidth - TOTAL_REDUCTION;
              let innerH = newHeight - TOTAL_REDUCTION;
              if (edges.top || edges.bottom) innerW = innerH * imgRatio;
              else innerH = innerW / imgRatio;
              newWidth = innerW + TOTAL_REDUCTION;
              newHeight = innerH + TOTAL_REDUCTION;
            }

            let x = oldX;
            let y = oldY;
            if (edges.left) x = oldX + oldW - newWidth;
            if (edges.top) y = oldY + oldH - newHeight;

            positionRef.current = { x, y, w: newWidth, h: newHeight };
            Object.assign(event.target.style, {
              width: `${newWidth}px`,
              height: `${newHeight}px`,
              transform: `translate(${x}px, ${y}px)`,
            });
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

            propsRef.current.onUpdate({
              ...propsRef.current.signature,
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
  }, [readOnly, documentId]);

  // --- Handlers ---
  const handlePageChange = (newPage) => {
    const { signature, totalPages, onUpdate } = propsRef.current;
    if (newPage < 1 || newPage > totalPages) return;
    onUpdate({ ...signature, pageNumber: newPage });
  };

  const handleDelete = () => {
    propsRef.current.onDelete(propsRef.current.signature.id);
  };

  const handleStyle = "absolute w-3 h-3 bg-white border border-blue-600 rounded-full z-[60] pointer-events-auto";
  let borderClass = "";
  if (isActive && !readOnly) borderClass = "border border-blue-500";
  else if (!readOnly) borderClass = "hover:border hover:border-blue-300 hover:border-dashed";

  return (
    <div
      ref={elementRef}
      data-ratio={signature.ratio || ""}
      data-id={signature.id}
      className={`placed-signature absolute select-none touch-none group flex flex-col ${isActive ? "z-50" : "z-20"}`}
      style={{
        left: 0,
        top: 0,
        transform: `translate(${positionRef.current.x}px, ${positionRef.current.y}px)`,
        transition: isDragging || isResizing ? "none" : "transform 0.1s linear",
        width: positionRef.current.w ? `${positionRef.current.w}px` : "auto",
        height: positionRef.current.h ? `${positionRef.current.h}px` : "auto",
        cursor: readOnly ? "default" : isDragging ? "grabbing" : "grab",
      }}
      onMouseDown={(e) => {
        if (!readOnly) {
          console.log(`✋ SELECT: Signature ${signature.id} (mouse)`);
          onSelect(signature.id, e.shiftKey);
        }
      }}
      // ❌ HAPUS onPointerDown yang stopPropagation, karena menganggu interact.js drag
      // Marquee selection sudah ada check: if (e.target.closest(".placed-signature")) return;
      // Jadi tidak perlu stopPropagation di sini. Event akan flow ke interact.js untuk drag detection.
    >
      <div style={{ padding: `${CSS_PADDING}px` }} className={`relative w-full h-full flex items-center justify-center transition-all duration-100 ${borderClass}`}>
        {isActive && !readOnly && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white border border-slate-300 shadow-lg rounded-md p-1 z-[70] whitespace-nowrap">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePageChange(signature.pageNumber - 1);
              }}
              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded disabled:opacity-30 transition-colors"
              disabled={signature.pageNumber <= 1}
            >
              <FaChevronLeft size={10} />
            </button>
            <div className="h-4 w-[1px] bg-slate-200 mx-1"></div>
            <div className="relative group/select">
              <select
                value={signature.pageNumber}
                onChange={(e) => {
                  e.stopPropagation();
                  handlePageChange(Number(e.target.value));
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className="appearance-none bg-transparent font-bold text-xs text-slate-700 py-1 pl-2 pr-6 rounded hover:bg-slate-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    Hal {num}
                  </option>
                ))}
              </select>
              <div className="absolute right-1 top-1.5 pointer-events-none text-slate-400">
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
            <div className="h-4 w-[1px] bg-slate-200 mx-1"></div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePageChange(signature.pageNumber + 1);
              }}
              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded disabled:opacity-30 transition-colors"
              disabled={signature.pageNumber >= totalPages}
            >
              <FaChevronRight size={10} />
            </button>
          </div>
        )}

        {isActive && !readOnly && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="absolute -top-3 -right-3 w-6 h-6 bg-blue-600 text-white rounded-full border-2 border-white flex items-center justify-center shadow-md hover:bg-blue-700 z-[70] pointer-events-auto"
          >
            <FaTimes size={10} />
          </button>
        )}

        {isActive && !readOnly && (
          <>
            <div className={`${handleStyle} -top-1.5 -left-1.5 cursor-nw-resize`}></div>
            <div className={`${handleStyle} -top-1.5 -right-1.5 cursor-ne-resize`}></div>
            <div className={`${handleStyle} -bottom-1.5 -left-1.5 cursor-sw-resize`}></div>
            <div className={`${handleStyle} -bottom-1.5 -right-1.5 cursor-se-resize`}></div>
          </>
        )}

        <div className={`w-full h-full relative overflow-hidden transition-colors duration-200 ${isActive && !readOnly ? "border-red-400 border" : "border-transparent"}`}>
          {signature.signatureImageUrl ? (
            <img
              src={signature.signatureImageUrl}
              alt="Signature"
              style={{ imageRendering: "high-quality", WebkitFontSmoothing: "antialiased" }}
              className="w-full h-full object-contain pointer-events-none select-none"
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
                  propsRef.current.onUpdate({
                    ...propsRef.current.signature,
                    width_display: finalDisplayW,
                    height_display: finalDisplayH,
                    ratio: aspectRatio,
                    width: innerW / parentRect.width,
                    height: innerH / parentRect.height,
                    positionX: realX / parentRect.width,
                    positionY: realY / parentRect.height,
                    x_display: positionRef.current.x,
                    y_display: positionRef.current.y,
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
