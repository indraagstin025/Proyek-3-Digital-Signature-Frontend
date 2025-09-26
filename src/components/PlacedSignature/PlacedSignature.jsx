import React, { useEffect, useRef } from "react";
import interact from "interactjs";
import { FaTrash, FaArrowsAlt } from "react-icons/fa";

const PlacedSignature = ({ signature, onUpdate, onDelete }) => {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;


    interact(element)
      .draggable({
        listeners: {
          move(event) {
            const target = event.target;
            const x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
            const y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;
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
              positionX: newX / parentRect.width,
              positionY: newY / parentRect.height,
            });
          },
        },
        inertia: true,
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
        modifiers: [interact.modifiers.aspectRatio({ ratio: "preserve" })],
        inertia: true,
      });

    return () => interact(element).unset();
  }, [signature, onUpdate]);

  return (
    <div
      ref={ref}
       className="placed-field group absolute border-2 border-dashed border-transparent hover:border-green-500 hover:bg-green-500/10 touch-none box-border flex items-center justify-center p-1 z-10"

      style={{
        left: 0,
        top: 0,
        width: `${signature.width_display}px`,
        height: `${signature.height_display}px`,
        transform: `translate(${signature.x_display}px, ${signature.y_display}px)`,
      }}
      data-x={signature.x_display}
      data-y={signature.y_display}
    >
      <img
        src={signature.signatureImageUrl}
        alt="Tanda Tangan"
        className="object-contain pointer-events-none"
        style={{ width: "100%", height: "100%" }}
        onLoad={(e) => {
          const parentRect = ref.current?.parentElement?.getBoundingClientRect();
          if (!parentRect) return;

          const naturalWidth = e.target.naturalWidth;
          const naturalHeight = e.target.naturalHeight;
          const aspectRatio = naturalWidth / naturalHeight;

          // Batasi max width biar tidak melar ke samping
          const maxWidth = parentRect.width * 0.3;
          const displayWidth = Math.min(naturalWidth, maxWidth);
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

      <div className="field-toolbar absolute top-[-30px] right-0 hidden group-hover:flex gap-1 bg-gray-800 rounded p-1">
        <button
          className="p-1 text-white hover:bg-gray-700 rounded cursor-move"
          title="Geser"
        >
          <FaArrowsAlt />
        </button>
        <button
          onClick={() => onDelete(signature.id)}
          className="p-1 text-red-500 hover:bg-gray-700 rounded"
          title="Hapus"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

export default PlacedSignature;
