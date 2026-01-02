'use client';

import React from 'react';
import { X } from 'lucide-react';

import { USER_AGREEMENT_DISCLAIMER_TEXT } from '@/lib/userAgreementDisclaimer';

interface UserAgreementModalProps {
  isOpen: boolean;
  onAgree: () => void;
  onClose?: () => void;
}

export default function UserAgreementModal({ isOpen, onAgree, onClose }: UserAgreementModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="rounded-xl shadow-2xl border-3 w-full border-surface-highlight max-w-2xl bg-surface">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-2">User Agreement Disclaimer</h3>
              <p className="text-sm text-gray-300">
                <strong>User Agreement Disclaimer:</strong>
                <br />
                {USER_AGREEMENT_DISCLAIMER_TEXT}
              </p>
            </div>
            {onClose ? (
              <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            ) : null}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onAgree}
              className="flex-1 px-4 py-2 rounded-lg transition-colors bg-primary-600 text-white hover:bg-primary-700"
            >
              I Agree
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
