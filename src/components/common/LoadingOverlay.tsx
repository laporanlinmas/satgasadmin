import React from 'react';
import { useApp } from '../../App';

export const LoadingOverlay: React.FC = () => {
  const { loading, loadingMessage } = useApp();

  if (!loading) return null;

  return (
    <div
      id="lov"
      className="on fixed inset-0 z-[99990] flex flex-col items-center justify-center gap-[13px] bg-[var(--lov-bg)] opacity-100 pointer-events-auto backdrop-blur-[8px] transition-opacity duration-200 print:hidden"
    >
      <div className="relative h-11 w-11">
        <div className="h-11 w-11 rounded-full border-[3px] border-[var(--border)] border-t-blue animate-spin-custom" />
        <div className="absolute inset-[9px] rounded-full border-2 border-[var(--border)] border-b-gold animate-spin-reverse" />
      </div>
      <span id="lmsg" className="text-[.72rem] font-bold tracking-[.04em] text-mid">{loadingMessage}</span>
    </div>
  );
};
