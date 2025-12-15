import React from "react";
import { FaSpinner, FaSave, FaTools, FaPenNib } from "react-icons/fa";

const MobileFloatingActions = ({ 
  canSign, 
  isSignedSuccess, 
  hasMySignatures, 
  isSaving, 
  onSave, 
  onToggleSidebar, 
  onOpenModal 
}) => {
  if (!canSign || isSignedSuccess) return null;

  return (
    <div className="fixed top-32 right-4 z-50 md:hidden flex flex-col items-end gap-3 pointer-events-none">
      {hasMySignatures && (
        <button 
          onClick={onSave} 
          disabled={isSaving} 
          className="pointer-events-auto w-10 h-10 rounded-full bg-green-600 text-white shadow-lg flex items-center justify-center hover:bg-green-700"
        >
          {isSaving ? <FaSpinner className="animate-spin text-xs" /> : <FaSave size={16} />}
        </button>
      )}
      
      <button 
        onClick={onToggleSidebar} 
        className="pointer-events-auto w-10 h-10 rounded-full bg-slate-700 text-white shadow-lg flex items-center justify-center hover:bg-slate-800"
      >
        <FaTools size={14} />
      </button>
      
      <button 
        onClick={onOpenModal} 
        className="pointer-events-auto w-12 h-12 rounded-full bg-blue-600 text-white shadow-xl flex items-center justify-center hover:bg-blue-700"
      >
        <FaPenNib size={16} />
      </button>
    </div>
  );
};

export default MobileFloatingActions;