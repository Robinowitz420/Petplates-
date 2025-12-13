import React from 'react';
import Image from 'next/image';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isDeleteModal?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDeleteModal = false,
}: ConfirmModalProps) {
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div 
        className={`rounded-xl shadow-2xl border-3 w-full ${isDeleteModal ? 'border-orange-500 max-w-2xl' : 'border-surface-highlight max-w-md'}`}
        style={isDeleteModal ? { backgroundColor: '#143424' } : {}}
      >
        <div className={`${isDeleteModal ? 'p-10' : 'p-6'}`}>
          <div className="flex items-start gap-6">
            {isDeleteModal && (
              <div className="flex-shrink-0">
                <Image
                  src="/images/emojis/Mascots/Harvest Hamster/HHReaper.jpg"
                  alt="Harvest Hamster"
                  width={240}
                  height={240}
                  className="w-[240px] h-[240px] object-contain mascot-icon mascot-farmer-fluff"
                  unoptimized
                />
              </div>
            )}
            {!isDeleteModal && (
              <div className="flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-gray-400">{message}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-surface-highlight text-foreground rounded-lg hover:bg-surface-lighter transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                isDeleteModal
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
