import React, { useEffect, useRef, useState } from "react";
import interact from "interactjs";
import { FaTimes } from "react-icons/fa"; 

const PlacedSignature = ({ signature, onUpdate, onDelete }) => {
  const ref = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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
            const target = event.target;
            const x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
            const y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

            target.style.transform = `translate(${x}px, ${y}px)`;
            target.setAttribute("data-x", x);
            target.setAttribute("data-y", y);
          },
          end(event) {
            setIsDragging(false);
            event.target.style.cursor = "grab";
            
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
              width_display: event.rect.width,
              height_display: event.rect.height,
              positionX: newX / parentRect.width,
              positionY: newY / parentRect.height,
              width: event.rect.width / parentRect.width,
              height: event.rect.height / parentRect.height,
            });
          },
        },
        modifiers: [
          interact.modifiers.aspectRatio({
            ratio: "preserve",
          }),
          interact.modifiers.restrictSize({
            min: { width: 80, height: 50 },
          }),
        ],
      });

    return () => interact(element).unset();
  }, [signature, onUpdate]);

  const handleStyle = "absolute w-3 h-3 bg-white border border-blue-600 rounded-full z-30";

  return (
    <div
      ref={ref}
      className={`absolute select-none touch-none group flex flex-col ${
        isActive ? "z-50" : "z-10"
      }`}
      style={{
        left: 0,
        top: 0,
        transform: `translate(${signature.x_display}px, ${signature.y_display}px)`,
        width: signature.width_display ? `${signature.width_display}px` : "auto",
        height: signature.height_display ? `${signature.height_display}px` : "auto",
        cursor: isDragging ? "grabbing" : "grab",
      }}
      data-x={signature.x_display}
      data-y={signature.y_display}
      data-id={signature.id}
      onMouseDown={() => setIsActive(true)}
      onTouchStart={() => setIsActive(true)}
    >
      {/* --- LAPISAN 1 (OUTER): Border Biru Interaktif --- */}
      <div
        className={`relative w-full h-full flex items-center justify-center transition-all duration-100 ${
          isActive ? "border border-blue-500 p-3" : "p-3 hover:border hover:border-blue-300 hover:border-dashed"
        }`}
      >
        
        {/* --- TOMBOL CLOSE (X) --- */}
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

        {/* --- RESIZE HANDLES --- */}
        {isActive && (
          <>
            <div className={`${handleStyle} -top-1.5 -left-1.5 cursor-nw-resize`}></div>
            <div className={`${handleStyle} -top-1.5 -right-1.5 cursor-ne-resize`}></div>
            <div className={`${handleStyle} -bottom-1.5 -left-1.5 cursor-sw-resize`}></div>
            <div className={`${handleStyle} -bottom-1.5 -right-1.5 cursor-se-resize`}></div>
          </>
        )}

        {/* --- LAPISAN 2 (INNER): Border Merah/Canvas --- */}
        {/* PERUBAHAN DISINI: Logic className kondisional */}
        <div 
          className={`w-full h-full border relative overflow-hidden transition-colors duration-200 ${
            isActive 
              ? "border-red-400" // Jika diklik: Merah
              : "border-transparent group-hover:border-red-400" // Jika diam: Transparan. Jika hover: Merah
          }`}
        >
            <img
            src={signature.signatureImageUrl}
            alt="Signature"
            className="w-full h-full object-contain pointer-events-none select-none"
            onLoad={(e) => {
                const parentRect = ref.current?.parentElement?.getBoundingClientRect();
                if (!parentRect || (signature.width_display && signature.height_display)) return;
                
                const naturalWidth = e.target.naturalWidth;
                const naturalHeight = e.target.naturalHeight;
                const aspectRatio = naturalWidth / naturalHeight;
                
                const defaultWidth = Math.max(parentRect.width * 0.2, 150);
                const displayWidth = Math.min(naturalWidth, defaultWidth);
                const displayHeight = displayWidth / aspectRatio;

                const paddingOffset = 24; 

                onUpdate({
                ...signature,
                width_display: displayWidth + paddingOffset,
                height_display: displayHeight + paddingOffset,
                width: (displayWidth + paddingOffset) / parentRect.width,
                height: (displayHeight + paddingOffset) / parentRect.height,
                });
            }}
            />
        </div>

      </div>
    </div>
  );
};

export default PlacedSignature;