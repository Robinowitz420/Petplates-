'use client';

import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonClass = 'bg-red-600 hover:bg-red-700'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  // Check if this is a delete confirmation (red button)
  const isDeleteModal = confirmButtonClass.includes('red');
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`bg-surface rounded-xl shadow-2xl border-3 w-full max-w-md ${isDeleteModal ? 'border-orange-500' : 'border-surface-highlight'}`}>
        <div className="flex items-start justify-between p-6 border-b border-surface-highlight">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-900/30 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-foreground">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-surface-highlight"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-300 text-base leading-relaxed">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-surface-highlight">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-semibold text-gray-300 hover:text-white hover:bg-surface-highlight transition-colors border-green-500"
            style={{ borderWidth: '3px' }}
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-lg font-semibold text-white transition-colors ${confirmButtonClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
