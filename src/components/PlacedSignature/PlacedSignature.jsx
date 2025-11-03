import React, { useEffect, useRef, useState } from "react";
import interact from "interactjs";
import { FaTrash, FaArrowsAlt } from "react-icons/fa";

const PlacedSignature = ({ signature, onUpdate, onDelete }) => {
  const ref = useRef(null);
  const [isActive, setIsActive] = useState(false);

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
            event.target.style.cursor = "grabbing";
            event.target.style.willChange = "transform";
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
            event.target.style.cursor = "grab";
            event.target.style.willChange = "auto";

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

  return (
    <div
      ref={ref}
      className="placed-field absolute z-10 select-none"
      draggable="true"
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
      onClick={() => setIsActive(true)}
    >
      <div
        className={`relative 
  ${isActive ? "border-2 border-dashed border-blue-500 rounded-lg" : ""}`}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <img
          src={signature.signatureImageUrl}
          alt="Tanda Tangan"
          className="object-contain pointer-events-none w-full h-full select-none"
          onLoad={(e) => {
            const parentRect = ref.current?.parentElement?.getBoundingClientRect();
            if (!parentRect) return;

            if (signature.width_display && signature.height_display) return;

            const naturalWidth = e.target.naturalWidth;
            const naturalHeight = e.target.naturalHeight;
            const aspectRatio = naturalWidth / naturalHeight;

            const defaultWidth = Math.max(parentRect.width * 0.5, 200);
            const displayWidth = Math.min(naturalWidth, defaultWidth);
            const displayHeight = displayWidth / aspectRatio;

            onUpdate({
              ...signature,
              width_display: displayWidth,
              height_display: displayHeight,
              width: displayWidth / parentRect.width,
              height: displayHeight / parentRect.height,
            });
          }}
        />

        {isActive && (
          <>
            <span className="absolute w-3 h-3 bg-white border border-gray-400 rounded-full -top-1 -left-1"></span>
            <span className="absolute w-3 h-3 bg-white border border-gray-400 rounded-full -top-1 -right-1"></span>
            <span className="absolute w-3 h-3 bg-white border border-gray-400 rounded-full -bottom-1 -left-1"></span>
            <span className="absolute w-3 h-3 bg-white border border-gray-400 rounded-full -bottom-1 -right-1"></span>
          </>
        )}

        {isActive && (
          <div className="field-toolbar absolute -top-3 right-0 flex items-center gap-1 bg-slate-800 rounded-md p-1 shadow-md">
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
