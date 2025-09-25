import React, { useEffect } from "react";
import interact from "interactjs";
import { FaPenNib, FaEdit } from "react-icons/fa";

const SignatureSidebar = ({ savedSignatureUrl, onOpenSignatureModal, onSave, isLoading }) => {
  useEffect(() => {
    if (!savedSignatureUrl) return;
    let clone = null;

    interact(".draggable-signature").draggable({
      inertia: true,
      autoScroll: true,
      listeners: {
        start(event) {
          const original = event.target;
          clone = original.cloneNode(true);

          clone.classList.add("dragging-clone", "draggable-signature");

          clone.style.width = `${original.offsetWidth}px`;
          clone.style.height = `${original.offsetHeight}px`;
          document.body.appendChild(clone);

          const originalRect = original.getBoundingClientRect();
          clone.style.left = `${originalRect.left}px`;
          clone.style.top = `${originalRect.top}px`;
          original.style.opacity = "0.5";
        },
        move(event) {
          if (!clone) return;
          const x = (parseFloat(clone.getAttribute("data-x")) || 0) + event.dx;
          const y = (parseFloat(clone.getAttribute("data-y")) || 0) + event.dy;
          clone.style.transform = `translate(${x}px, ${y}px)`;
          clone.setAttribute("data-x", x);
          clone.setAttribute("data-y", y);
        },
        end(event) {
          if (clone) clone.remove();
          event.target.style.opacity = "1";
          event.target.style.transform = "translate(0px, 0px)";
          event.target.removeAttribute("data-x");
          event.target.removeAttribute("data-y");
        },
      },
    });

    return () => interact(".draggable-signature").unset();
  }, [savedSignatureUrl]);

return (
<aside
  className="w-80 h-[calc(100vh-80px)]  
             bg-white dark:bg-gray-900 flex flex-col flex-shrink-0 
             border-l border-gray-200 dark:border-gray-700
             fixed top-20 right-0 z-30"
>

      {/* Bagian Header Sidebar */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
          Pilihan tanda tangan
        </h2>
      </div>

      {/* Bagian Konten Scrollable */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Kotak isian wajib diisi
          </p>
          {savedSignatureUrl ? (
            <div className="draggable-signature p-4 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 shadow-sm flex justify-between items-center cursor-grab touch-none">
              <img
                src={savedSignatureUrl}
                alt="Tanda Tangan"
                className="h-10 object-contain pointer-events-none"
              />
              <button
                onClick={onOpenSignatureModal}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <FaEdit size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenSignatureModal}
              className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <FaPenNib size={24} className="mb-2" />
              <span className="text-sm font-semibold">Klik untuk membuat</span>
            </button>
          )}
        </div>
      </div>

      {/* Bagian Footer Sidebar */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <button
          onClick={onSave}
          disabled={isLoading}
          className="w-full bg-red-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-wait"
        >
          {isLoading ? "Menyimpan..." : "Tanda tangani"}
        </button>
      </div>
    </aside>
  );

};

export default SignatureSidebar;
