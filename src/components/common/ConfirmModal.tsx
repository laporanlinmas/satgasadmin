import { AlertTriangle, Trash2 } from 'lucide-react';
import React from 'react';
import { Modal } from './Modal';

/** Utility styles tombol — dipilih per varian, tidak membawa nama class legacy. */
const BTN_DANGER =
  'inline-flex items-center gap-[5px] cursor-pointer rounded-md border border-[rgba(239,68,68,.12)] bg-redl px-[11px] py-[5px] text-[.66rem] font-bold text-red transition-all duration-200 hover:bg-red hover:text-white';
const BTN_PRIMARY =
  'inline-flex items-center gap-1.5 cursor-pointer rounded-md bg-blue px-4 py-2 text-[.74rem] font-bold text-white transition-all duration-200 hover:-translate-y-px hover:bg-blueh active:translate-y-0';
const BTN_SECONDARY =
  'inline-flex items-center gap-1.5 cursor-pointer rounded-md border border-border bg-card px-[15px] py-2 text-[.74rem] font-semibold text-mid transition-all duration-200 hover:-translate-y-px hover:border-bdark hover:bg-bg hover:text-text';

interface ConfirmModalProps {
  show: boolean;
  title?: string;
  msg: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  confirmVariant?: 'danger' | 'primary';
  confirmIcon?: React.ReactNode;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  show,
  title = 'Konfirmasi Hapus',
  msg,
  onConfirm,
  onCancel,
  confirmText = 'Hapus',
  confirmVariant = 'danger',
  confirmIcon = <Trash2 className="inline-block h-4 w-4 align-middle" />,
}) => {
  const danger = confirmVariant === 'danger';
  return (
    <Modal
      show={show}
      onClose={onCancel}
      size="sm"
      title={
        <span className={`flex items-center gap-[7px] ${danger ? 'text-red' : 'text-blue'}`}>
          <AlertTriangle className="inline-block h-4 w-4 align-middle" /> {title}
        </span>
      }
      footer={
        <>
          <button className={BTN_SECONDARY} onClick={onCancel}>
            Batal
          </button>
          <button className={danger ? BTN_DANGER : BTN_PRIMARY} onClick={onConfirm}>
            {confirmIcon && <span className="inline-flex items-center">{confirmIcon}</span>}
            {confirmText}
          </button>
        </>
      }
    >
      <p className="text-[.8rem] leading-relaxed text-mid">
        {msg}
      </p>
    </Modal>
  );
};
