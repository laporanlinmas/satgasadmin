import React, { useEffect } from 'react';

interface ModalProps {
  show: boolean;
  onClose: () => void;
  title: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Menggantikan SELURHUH kelas lebar bawaan (`w-full`, `max-w-*` dari `size`,
   * dan override portrait) — dipakai bila modal butuh lebar khusus tanpa inline style.
   * Contoh: `w-[94vw] max-w-[580px] portrait:max-md:w-[calc(100vw-20px)]`
   */
  widthClass?: string;
  style?: React.CSSProperties;
}

export const Modal: React.FC<ModalProps> = ({
  show,
  onClose,
  title,
  footer,
  children,
  size = 'md',
  widthClass,
  style,
}) => {
  // Lock body scroll saat modal aktif
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [show]);

  if (!show) return null;

  // `.mbox.sm` → 420px (portrait: full-width), `.mbox.xl` → 960px, selain itu default 640px
  const sizeCls =
    widthClass ??
    (size === 'sm'
      ? 'w-full max-w-[420px] portrait:max-md:w-[calc(100vw-20px)] portrait:max-md:max-w-[calc(100vw-20px)]'
      : size === 'xl'
        ? 'w-full max-w-[960px] portrait:max-md:w-[calc(100vw-20px)]'
        : 'w-full max-w-[640px] portrait:max-md:w-[calc(100vw-20px)]');

  return (
    <div
      className="mov on flex fixed inset-0 z-[99900] items-center justify-center overflow-y-auto overscroll-contain bg-[rgba(6,16,32,.52)] p-3.5 backdrop-blur-[3px] portrait:max-md:p-3"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`${sizeCls} max-h-[92vh] overflow-y-auto rounded-[var(--r)] border border-border bg-card shadow-[var(--shl)] animate-modal-in overscroll-contain portrait:max-md:mx-auto portrait:max-md:max-h-[88vh]`}
        style={style}
      >
        <div className="sticky top-0 z-[2] flex items-center justify-between rounded-t-[var(--r)] border-b border-border bg-card px-[18px] py-3.5">
          <h5 className="flex items-center gap-[7px] text-[.86rem] font-extrabold">{title}</h5>
          <button className="border-none bg-transparent px-[3px] text-[1.2rem] leading-none text-muted" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>
        <div className="px-[18px] py-4">
          {children}
        </div>
        {footer && (
          <div className="sticky bottom-0 z-[2] flex flex-wrap justify-end gap-[7px] rounded-b-[var(--r)] border-t border-border bg-card px-[18px] py-[11px] portrait:max-md:justify-start portrait:max-md:gap-[5px] portrait:max-md:px-3 portrait:max-md:py-[9px] portrait:max-md:[&>button]:px-[9px] portrait:max-md:[&>button]:py-[5px] portrait:max-md:[&>button]:text-[.62rem] portrait:max-md:[&>button]:gap-[3px] portrait:max-md:[&_button_svg]:size-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
