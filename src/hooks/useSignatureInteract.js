import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import interact from "interactjs";
import { socketService } from "../services/socketService";
import { throttle } from "../utils/throttle";

const CSS_PADDING = 12;
const CSS_BORDER = 1;
const CONTENT_OFFSET = CSS_PADDING + CSS_BORDER;
const TOTAL_REDUCTION = CONTENT_OFFSET * 2;

export const useSignatureInteract = ({ signature, onUpdate, onDelete, readOnly, documentId }) => {
  const elementRef = useRef(null);

  const positionRef = useRef({
    x: signature.x_display || 0,
    y: signature.y_display || 0,
    w: signature.width_display || 0,
    h: signature.height_display || 0,
  });

  const [isActive, setIsActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRemoteActive, setIsRemoteActive] = useState(false);

  // Throttled emitter agar socket tidak spam
  const emitSocketDrag = useMemo(
    () =>
      throttle((data) => {
        socketService.emitDrag(data);
      }, 30),
    []
  );

  // Effect 1: Indikator Aktivitas User Lain (Remote Active)
  useEffect(() => {
    if (!isDragging && !isActive && !isResizing) {
      setIsRemoteActive(true);
      const timer = setTimeout(() => setIsRemoteActive(false), 500);
      return () => clearTimeout(timer);
    }
  }, [signature.positionX, signature.positionY, signature.width, signature.height, isDragging, isActive, isResizing]);

  // Effect 2: Kalkulasi Posisi Responsif (Pixel Calculation)
  useEffect(() => {
    const element = elementRef.current;
    if (!element || !element.parentElement) return;

    const calculatePosition = () => {
      const parentRect = element.parentElement.getBoundingClientRect();
      if (parentRect.width < 50) return;

      const hasPositionData = signature.positionX !== null && !isNaN(signature.positionX);
      const needsCalculation = (signature.x_display === 0 || (!isDragging && !isActive && !isResizing)) && hasPositionData;

      if (needsCalculation) {
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
  }, [signature.id, signature.x_display, signature.y_display, signature.positionX, signature.positionY, signature.width, signature.height, isDragging, isActive, isResizing]);

  // Effect 3: Click Outside Handler
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (elementRef.current && !elementRef.current.contains(e.target)) setIsActive(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Effect 4: InteractJS Setup (Drag & Resize Logic)
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
            positionRef.current.x += event.dx;
            positionRef.current.y += event.dy;
            event.target.style.transform = `translate(${positionRef.current.x}px, ${positionRef.current.y}px)`;

            if (documentId) {
              const parentRect = event.target.parentElement.getBoundingClientRect();
              const realImageX = positionRef.current.x + CONTENT_OFFSET;
              const realImageY = positionRef.current.y + CONTENT_OFFSET;
              const realImageW = positionRef.current.w - TOTAL_REDUCTION;
              const realImageH = positionRef.current.h - TOTAL_REDUCTION;

              emitSocketDrag({
                documentId,
                signatureId: signature.id,
                positionX: realImageX / parentRect.width,
                positionY: realImageY / parentRect.height,
                width: realImageW / parentRect.width,
                height: realImageH / parentRect.height,
              });
            }
          },
          end(event) {
            setIsDragging(false);
            event.target.style.cursor = "grab";
            const parentRect = event.target.parentElement.getBoundingClientRect();
            const { x, y, w, h } = positionRef.current;
            const realImageX = x + CONTENT_OFFSET;
            const realImageY = y + CONTENT_OFFSET;
            const realImageW = w - TOTAL_REDUCTION;
            const realImageH = h - TOTAL_REDUCTION;

            onUpdate({
              ...signature,
              x_display: x, y_display: y, width_display: w, height_display: h,
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
          start() { setIsResizing(true); },
          move(event) {
            const { x: oldX, y: oldY, w: oldW, h: oldH } = positionRef.current;
            const { deltaRect, edges } = event;

            let x = oldX + (deltaRect.left || 0);
            let y = oldY + (deltaRect.top || 0);
            let newWidth = oldW - (deltaRect.left || 0) + (deltaRect.right || 0);
            let newHeight = oldH - (deltaRect.top || 0) + (deltaRect.bottom || 0);

            newWidth = Math.max(newWidth, 80);
            newHeight = Math.max(newHeight, 50);

            const imgRatio = parseFloat(event.target.dataset.ratio) ||
              (oldW > TOTAL_REDUCTION && oldH > TOTAL_REDUCTION
                ? (oldW - TOTAL_REDUCTION) / (oldH - TOTAL_REDUCTION)
                : null);

            if (imgRatio) {
              let innerW = newWidth - TOTAL_REDUCTION;
              let innerH = newHeight - TOTAL_REDUCTION;
              if (edges.top || edges.bottom) innerW = innerH * imgRatio;
              else innerH = innerW / imgRatio;
              newWidth = innerW + TOTAL_REDUCTION;
              newHeight = innerH + TOTAL_REDUCTION;
            }

            if (edges.left) x = oldX + oldW - newWidth;
            if (edges.top) y = oldY + oldH - newHeight;

            positionRef.current = { x, y, w: newWidth, h: newHeight };
            Object.assign(event.target.style, {
              width: `${newWidth}px`, height: `${newHeight}px`, transform: `translate(${x}px, ${y}px)`,
            });

            if (documentId) {
              const parentRect = event.target.parentElement.getBoundingClientRect();
              emitSocketDrag({
                documentId,
                signatureId: signature.id,
                positionX: (x + CONTENT_OFFSET) / parentRect.width,
                positionY: (y + CONTENT_OFFSET) / parentRect.height,
                width: (newWidth - TOTAL_REDUCTION) / parentRect.width,
                height: (newHeight - TOTAL_REDUCTION) / parentRect.height,
              });
            }
          },
          end(event) {
            setIsResizing(false);
            const parentRect = event.target.parentElement.getBoundingClientRect();
            const { x, y, w, h } = positionRef.current;
            onUpdate({
              ...signature,
              width_display: w, height_display: h, x_display: x, y_display: y,
              positionX: (x + CONTENT_OFFSET) / parentRect.width,
              positionY: (y + CONTENT_OFFSET) / parentRect.height,
              width: (w - TOTAL_REDUCTION) / parentRect.width,
              height: (h - TOTAL_REDUCTION) / parentRect.height,
            });
          },
        },
        modifiers: [interact.modifiers.restrictSize({ min: { width: 80, height: 50 } })],
      });

    return () => interactable.unset();
  }, [readOnly, signature.id, onUpdate, documentId, emitSocketDrag]);

  // Handler: Image Loaded (Set Initial Size)
  const handleImageLoad = useCallback((e) => {
    if (positionRef.current.w > 0) return;
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
    
    if (elementRef.current) {
        elementRef.current.style.width = `${finalDisplayW}px`;
        elementRef.current.style.height = `${finalDisplayH}px`;
    }

    if (!readOnly) {
      onUpdate({
        ...signature,
        width_display: finalDisplayW,
        height_display: finalDisplayH,
        ratio: aspectRatio,
        width: innerW / parentRect.width,
        height: innerH / parentRect.height,
        positionX: (positionRef.current.x + CONTENT_OFFSET) / parentRect.width,
        positionY: (positionRef.current.y + CONTENT_OFFSET) / parentRect.height,
      });
    }
  }, [readOnly, onUpdate, signature]);

  // Handler: Mouse Down
  const handleMouseDown = (e) => {
    if (!readOnly) {
        e.stopPropagation();
        setIsActive(true);
    }
  };

  return {
    elementRef,
    positionRef,
    isActive,
    isDragging,
    isResizing,
    isRemoteActive,
    handleMouseDown,
    handleImageLoad,
    CSS_PADDING
  };
};