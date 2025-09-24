import React, { useEffect, useRef } from "react";
import interact from "interactjs";
import { FaTrash, FaArrowsAlt } from "react-icons/fa";

const PlacedSignature = ({ signature, onUpdate, onDelete }) => {
  const ref = useRef(null);
  const propsRef = useRef({ signature, onUpdate, onDelete });

  useEffect(() => {
    propsRef.current = { signature, onUpdate, onDelete };
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    interact(element)
      .draggable({
        listeners: {
          move(event) {
            const target = event.target;
            let x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
            let y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

            target.style.transform = `translate(${x}px, ${y}px)`;
            target.setAttribute("data-x", x);
            target.setAttribute("data-y", y);
          },
          end(event) {
            const target = event.target;
            const { signature, onUpdate } = propsRef.current;

            const newX = parseFloat(target.getAttribute("data-x")) || 0;
            const newY = parseFloat(target.getAttribute("data-y")) || 0;

            // hitung ulang posisi relatif ke skala halaman
            const parentRect = target.parentElement.getBoundingClientRect();
            const scaleFactor = parentRect.width / signature.originalWidth;

            onUpdate({
              ...signature,
              x: newX,
              y: newY,
              positionX: newX / scaleFactor,
              positionY: newY / scaleFactor,
            });
          },
        },
        // ❌ dihapus restriction ke parent supaya bisa pindah halaman
        inertia: true,
      })
      .resizable({
        edges: { left: true, right: true, bottom: true, top: true },
        listeners: {
          move(event) {
            const target = event.target;
            const { signature } = propsRef.current;

            let x = parseFloat(target.getAttribute("data-x")) || signature.x;
            let y = parseFloat(target.getAttribute("data-y")) || signature.y;

            target.style.width = `${event.rect.width}px`;
            target.style.height = `${event.rect.height}px`;
            x += event.deltaRect.left;
            y += event.deltaRect.top;

            target.style.transform = `translate(${x}px, ${y}px)`;
            target.setAttribute("data-x", x);
            target.setAttribute("data-y", y);
          },
          end(event) {
            const { signature, onUpdate } = propsRef.current;

            const newX = parseFloat(event.target.getAttribute("data-x")) || signature.x;
            const newY = parseFloat(event.target.getAttribute("data-y")) || signature.y;

            const parentRect = event.target.parentElement.getBoundingClientRect();
            const scaleFactor = parentRect.width / signature.originalWidth;

            onUpdate({
              ...signature,
              x: newX,
              y: newY,
              width: event.rect.width,
              height: event.rect.height,
              positionX: newX / scaleFactor,
              positionY: newY / scaleFactor,
            });
          },
        },
        modifiers: [
          interact.modifiers.aspectRatio({ ratio: "preserve" }),
        ],
      });

    return () => interact(element).unset();
  }, []);

  return (
    <div
      ref={ref}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("signatureId", signature.id);
      }}
      className="placed-field group absolute border-2 border-dashed border-green-500 bg-green-500/10 touch-none box-border flex items-center justify-center p-1 z-10"
      style={{
        left: 0,
        top: 0,
        width: `${signature.width}px`,
        height: `${signature.height}px`,
        transform: `translate(${signature.x}px, ${signature.y}px)`,
      }}
      data-x={signature.x}
      data-y={signature.y}
    >
      <img
        src={signature.signatureImageUrl}
        alt="Tanda Tangan"
        className="w-full h-full object-contain pointer-events-none"
      />
      <div className="field-toolbar absolute top-[-30px] right-0 hidden group-hover:flex gap-1 bg-gray-800 rounded p-1">
        <button className="p-1 text-white hover:bg-gray-700 rounded cursor-move">
          <FaArrowsAlt />
        </button>
        <button
          onClick={() => onDelete(signature.id)}
          className="p-1 text-red-500 hover:bg-gray-700 rounded"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

export default PlacedSignature;
