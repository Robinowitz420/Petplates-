'use client';

import React, { useCallback, useEffect, useState } from 'react';

import UserAgreementModal from '@/components/UserAgreementModal';
import { USER_AGREEMENT_STORAGE_KEY } from '@/lib/userAgreementDisclaimer';

interface UserAgreementGateClientProps {
  children: React.ReactNode;
}

export default function UserAgreementGateClient({ children }: UserAgreementGateClientProps) {
  const [hasAgreed, setHasAgreed] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(USER_AGREEMENT_STORAGE_KEY);
      setHasAgreed(raw === 'true');
    } catch {
      setHasAgreed(false);
    } finally {
      setIsChecking(false);
    }
  }, []);

  const handleAgree = useCallback(() => {
    try {
      localStorage.setItem(USER_AGREEMENT_STORAGE_KEY, 'true');
    } catch {
    }
    setHasAgreed(true);
  }, []);

  return (
    <>
      {!isChecking && hasAgreed ? children : null}
      {!isChecking && !hasAgreed ? <UserAgreementModal isOpen={true} onAgree={handleAgree} /> : null}
    </>
  );
}
