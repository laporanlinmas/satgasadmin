import { Info } from 'lucide-react';
import React from 'react';
import { Modal } from './Modal';

interface AlertModalProps {
  show: boolean;
  title?: string;
  msg: string;
  onClose: () => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  show,
  title = 'Informasi',
  msg,
  onClose,
}) => {
  return (
    <Modal
      show={show}
      onClose={onClose}
      size="sm"
      title={
        <span className="flex items-center gap-[7px] text-blue">
          <Info className="w-4 h-4 inline-block align-middle" /> {title}
        </span>
      }
      footer={
        <button className="inline-flex items-center gap-1.5 rounded-md bg-blue px-5 py-1.5 text-[.74rem] font-bold text-white transition-all duration-200 hover:-translate-y-px hover:bg-blueh active:translate-y-0" onClick={onClose}>
          OK
        </button>
      }
    >
      <p className="whitespace-pre-line text-[.8rem] leading-[1.6] text-mid">
        {msg}
      </p>
    </Modal>
  );
};
