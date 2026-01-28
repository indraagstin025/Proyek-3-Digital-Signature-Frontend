import React, { useEffect, useRef, useState, useMemo } from "react";
import interact from "interactjs";
import { FaTimes, FaCopy } from "react-icons/fa";
import { socketService } from "../../services/socketService"; // Pastikan path ini benar

// Helper throttle
function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

const CSS_PADDING = 12;
const CSS_BORDER = 1;
const CONTENT_OFFSET = CSS_PADDING + CSS_BORDER;
const TOTAL_REDUCTION = CONTENT_OFFSET * 2;

const PlacedSignatureGroup = ({
  signature,
  onUpdate,
  onDelete,
  readOnly = false,
  documentId, // Wajib ada untuk socket room
  currentUser, // Wajib ada untuk proteksi
  isSelected = false, // ✅ Marquee selection state
  onSelect = () => { }, // ✅ Marquee selection callback
  totalPages = 1, // ✅ Untuk modal pindah halaman
}) => {
  const elementRef = useRef(null);

  // 1. LOGIKA KEPEMILIKAN
  const isOwner = useMemo(() => {
    if (!currentUser) return false;
    const ownerId = signature.userId || signature.signer?.id || signature.signerId;
    return String(ownerId) === String(currentUser.id);
  }, [currentUser, signature]);

  const canInteract = !readOnly && (isOwner || !signature.userId);

  // 2. REF & STATE
  const positionRef = useRef({
    x: signature.x_display || 0,
    y: signature.y_display || 0,
    w: signature.width_display || 0,
    h: signature.height_display || 0,
  });

  const [isActive, setIsActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  // State Remote
  const [isRemoteActive, setIsRemoteActive] = useState(false);
  const [isLockedByRemote, setIsLockedByRemote] = useState(false);
  const [showPageModal, setShowPageModal] = useState(false);

  // Handler pindah halaman
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;

    // Update local state
    onUpdate({ ...signature, pageNumber: newPage });

    // ✅ [REALTIME] Emit socket event to notify other users about page change
    if (documentId) {
      socketService.emitDrag({
        documentId,
        signatureId: signature.id,
        positionX: signature.positionX,
        positionY: signature.positionY,
        width: signature.width,
        height: signature.height,
        pageNumber: newPage, // Include new page number in socket event
      });
    }
  };

  // 3. SOCKET EMITTER
  const emitSocketDrag = useMemo(
    () =>
      throttle((data) => {
        if (documentId) socketService.emitDrag(data);
      }, 30),
    [documentId]
  );

  // 4. SOCKET LISTENER (REALTIME LOGIC)
  useEffect(() => {
    const handleRemoteMove = (data) => {
      // Cek ID & Konflik lokal
      if (data.signatureId !== signature.id) return;
      if (isDragging || isResizing) return;

      const element = elementRef.current;
      const parent = element?.parentElement;
      if (!element || !parent) return;

      const parentRect = parent.getBoundingClientRect();
      if (parentRect.width < 50) return;

      // Konversi Persen -> Pixel
      const calculatedX = data.positionX * parentRect.width - CONTENT_OFFSET;
      const calculatedY = data.positionY * parentRect.height - CONTENT_OFFSET;
      const calculatedW = data.width * parentRect.width + TOTAL_REDUCTION;
      const calculatedH = data.height * parentRect.height + TOTAL_REDUCTION;

      // Direct DOM Update
      element.style.transform = `translate(${calculatedX}px, ${calculatedY}px)`;
      element.style.width = `${calculatedW}px`;
      element.style.height = `${calculatedH}px`;

      // Update Ref
      positionRef.current = { x: calculatedX, y: calculatedY, w: calculatedW, h: calculatedH };

      // Visual Feedback
      setIsRemoteActive(true);
      setIsLockedByRemote(true);

      const timerId = `timer_${signature.id}`;
      if (window[timerId]) clearTimeout(window[timerId]);
      window[timerId] = setTimeout(() => {
        setIsRemoteActive(false);
        setIsLockedByRemote(false);
      }, 500);
    };

    socketService.onPositionUpdate(handleRemoteMove);
    return () => socketService.off("update_signature_position", handleRemoteMove);
  }, [signature.id, isDragging, isResizing]);

  // 5. INIT POSITION
  useEffect(() => {
    const element = elementRef.current;
    if (!element || !element.parentElement) return;

    const calculatePosition = () => {
      const parentRect = element.parentElement.getBoundingClientRect();
      if (parentRect.width < 50) return;
      if (canInteract && positionRef.current.w > 0 && (isDragging || isResizing || isActive)) return;

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
    calculatePosition();

    return () => resizeObserver.disconnect();
  }, [signature, canInteract, isDragging, isResizing, isActive]);

  // 6. CLICK OUTSIDE
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (elementRef.current && !elementRef.current.contains(e.target)) {
        setIsActive(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 7. INTERACT.JS (DRAG & RESIZE)
  useEffect(() => {
    const element = elementRef.current;
    if (!element || !canInteract || isLockedByRemote) return;

    const interactable = interact(element)
      .draggable({
        listeners: {
          start(event) {
            setIsDragging(true);
            setIsActive(true);
            event.target.style.cursor = "grabbing";
          },
          move(event) {
            positionRef.current.x += event.dx;
            positionRef.current.y += event.dy;
            event.target.style.transform = `translate(${positionRef.current.x}px, ${positionRef.current.y}px)`;

            // EMIT SOCKET
            if (documentId) {
              const parent = event.target.parentElement;
              if (parent) {
                const parentRect = parent.getBoundingClientRect();
                const realW = positionRef.current.w - TOTAL_REDUCTION;
                const realH = positionRef.current.h - TOTAL_REDUCTION;
                const realX = positionRef.current.x + CONTENT_OFFSET;
                const realY = positionRef.current.y + CONTENT_OFFSET;

                emitSocketDrag({
                  documentId,
                  signatureId: signature.id,
                  positionX: realX / parentRect.width,
                  positionY: realY / parentRect.height,
                  width: realW / parentRect.width,
                  height: realH / parentRect.height,
                });
              }
            }
          },
          end(event) {
            setIsDragging(false);
            event.target.style.cursor = "grab";
            const parent = event.target.parentElement;
            if (parent) {
              const parentRect = parent.getBoundingClientRect();
              const realW = positionRef.current.w - TOTAL_REDUCTION;
              const realH = positionRef.current.h - TOTAL_REDUCTION;
              const realX = positionRef.current.x + CONTENT_OFFSET;
              const realY = positionRef.current.y + CONTENT_OFFSET;

              onUpdate({
                ...signature,
                x_display: positionRef.current.x,
                y_display: positionRef.current.y,
                width_display: positionRef.current.w,
                height_display: positionRef.current.h,
                positionX: realX / parentRect.width,
                positionY: realY / parentRect.height,
                width: realW / parentRect.width,
                height: realH / parentRect.height,
              });
            }
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
            let newWidth = Math.max(oldW - (deltaRect.left || 0) + (deltaRect.right || 0), 80);
            let newHeight = Math.max(oldH - (deltaRect.top || 0) + (deltaRect.bottom || 0), 50);

            let x = oldX;
            let y = oldY;
            if (edges.left) x = oldX + oldW - newWidth;
            if (edges.top) y = oldY + oldH - newHeight;

            positionRef.current = { x, y, w: newWidth, h: newHeight };
            Object.assign(event.target.style, { width: `${newWidth}px`, height: `${newHeight}px`, transform: `translate(${x}px, ${y}px)` });

            // EMIT SOCKET RESIZE
            if (documentId) {
              const parent = event.target.parentElement;
              if (parent) {
                const pRect = parent.getBoundingClientRect();
                emitSocketDrag({
                  documentId,
                  signatureId: signature.id,
                  positionX: (x + CONTENT_OFFSET) / pRect.width,
                  positionY: (y + CONTENT_OFFSET) / pRect.height,
                  width: (newWidth - TOTAL_REDUCTION) / pRect.width,
                  height: (newHeight - TOTAL_REDUCTION) / pRect.height,
                });
              }
            }
          },
          end(event) {
            setIsResizing(false);
            const parent = event.target.parentElement;
            if (parent) {
              const pRect = parent.getBoundingClientRect();
              const { x, y, w, h } = positionRef.current;
              onUpdate({
                ...signature,
                width_display: w,
                height_display: h,
                x_display: x,
                y_display: y,
                positionX: (x + CONTENT_OFFSET) / pRect.width,
                positionY: (y + CONTENT_OFFSET) / pRect.height,
                width: (w - TOTAL_REDUCTION) / pRect.width,
                height: (h - TOTAL_REDUCTION) / pRect.height,
              });
            }
          },
        },
        modifiers: [interact.modifiers.restrictSize({ min: { width: 80, height: 50 } })],
      });

    return () => interactable.unset();
  }, [canInteract, signature.id, onUpdate, documentId, emitSocketDrag, isLockedByRemote]);

  // 8. RENDER JSX
  const handleStyle = "absolute w-3 h-3 bg-white border border-blue-600 rounded-full z-[60] pointer-events-auto";
  const displayName = signature.signerName || signature.signer?.name || "User Lain";
  let borderClass = "";
  if (isActive && canInteract) borderClass = "border border-blue-500";
  else if (isRemoteActive) borderClass = "border border-green-500 shadow-md ring-2 ring-green-200";
  else if (canInteract) borderClass = "hover:border hover:border-blue-300 hover:border-dashed";

  return (
    <div
      ref={elementRef}
      // 1. Pastikan class marker ada
      className={`placed-signature-item absolute select-none ${isDragging || isResizing ? "touch-none" : ""} group flex flex-col ${isSelected ? "z-50 ring-2 ring-blue-400" : isActive || isRemoteActive ? "z-50" : "z-10"}`}
      style={{
        left: 0,
        top: 0,
        transform: `translate(${positionRef.current.x}px, ${positionRef.current.y}px)`,
        transition: isDragging || isResizing ? "none" : "transform 0.1s linear",
        width: positionRef.current.w ? `${positionRef.current.w}px` : "auto",
        height: positionRef.current.h ? `${positionRef.current.h}px` : "auto",
        cursor: !canInteract ? "default" : isDragging ? "grabbing" : "grab",
        pointerEvents: isLockedByRemote ? "none" : "auto",
        backgroundColor: isSelected ? "rgba(59, 130, 246, 0.05)" : "transparent",
      }}
      // 2. 🔥 WAJIB ADA: Atribut data-id untuk deteksi Dropzone
      data-id={signature.id}
      onMouseDown={(e) => {
        if (canInteract && !isLockedByRemote) {
          e.stopPropagation();
          setIsActive(true);
          // ✅ Trigger selection pada onSelect callback
          onSelect(signature.id, e.shiftKey || e.ctrlKey || e.metaKey);
        }
      }}
    >
      <div style={{ padding: `${CSS_PADDING}px` }} className={`relative w-full h-full transition-all duration-200 ${isActive || isRemoteActive ? "bg-white/80 shadow-lg" : ""} ${borderClass}`}>
        {isActive && canInteract && !isLockedByRemote && (
          <>
            {/* Toolbar di tengah garis border atas */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 z-[70] pointer-events-auto">
              {/* Button Pindah Halaman (Copy Icon) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPageModal(true);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className="w-6 h-6 bg-blue-500 text-white rounded-md flex items-center justify-center shadow-md hover:bg-blue-600 transition-colors"
                title="Pindah ke halaman lain"
              >
                <FaCopy size={10} />
              </button>
              {/* Button Delete */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(signature.id);
                }}
                className="w-6 h-6 bg-slate-100 text-slate-500 rounded-md flex items-center justify-center shadow-md hover:bg-red-500 hover:text-white transition-colors border border-slate-200"
                title="Hapus tanda tangan"
              >
                <FaTimes size={10} />
              </button>
            </div>

            {/* Resize Handles */}
            <div className={`${handleStyle} -top-1.5 -left-1.5 cursor-nw-resize`}></div>
            <div className={`${handleStyle} -top-1.5 -right-1.5 cursor-ne-resize`}></div>
            <div className={`${handleStyle} -bottom-1.5 -left-1.5 cursor-sw-resize`}></div>
            <div className={`${handleStyle} -bottom-1.5 -right-1.5 cursor-se-resize`}></div>
          </>
        )}

        {/* Modal Pindah Halaman */}
        {showPageModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]"
            onClick={(e) => {
              e.stopPropagation();
              setShowPageModal(false);
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div
              className="bg-white rounded-xl shadow-2xl p-5 min-w-[280px] max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-slate-800 mb-3">Pindah ke Halaman</h3>
              <p className="text-sm text-slate-500 mb-4">Pilih halaman tujuan untuk tanda tangan ini:</p>

              <div className="grid grid-cols-5 gap-2 max-h-[200px] overflow-y-auto mb-4">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePageChange(num);
                      setShowPageModal(false);
                    }}
                    className={`p-2 rounded-lg text-sm font-medium transition-all ${signature.pageNumber === num
                      ? "bg-blue-500 text-white shadow-md"
                      : "bg-slate-100 text-slate-700 hover:bg-blue-100 hover:text-blue-600"
                      }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPageModal(false);
                  }}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}

        {isRemoteActive && <div className="absolute -top-6 left-0 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded shadow-sm z-[60] whitespace-nowrap animate-pulse">{displayName} sedang mengedit...</div>}

        {/* Container untuk gambar signature dengan padding untuk jarak */}
        <div className="w-full h-full p-1 box-border flex items-center justify-center">
          <div className={`w-full h-full overflow-hidden transition-all duration-200 ${isActive && canInteract ? "bg-white/80 shadow-lg border-red-400 border" : "border-transparent"}`}>
            {signature.signatureImageUrl ? (
              <img
                src={signature.signatureImageUrl}
                alt="Sign"
                className="w-full h-full object-contain pointer-events-none select-none"
              // (OnLoad logic Anda sebelumnya...)
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-yellow-100/50 border-2 border-dashed border-yellow-500 text-yellow-700 rounded">
                <span className="text-xs font-bold text-center">Sign Here</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlacedSignatureGroup;
