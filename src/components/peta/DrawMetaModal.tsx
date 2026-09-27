import { Ruler, Check, PenTool } from 'lucide-react';
import React from 'react';

const DRAW_WARNA_PRESET = [
  { hex: '#1e6fd9', lbl: 'Biru' }, { hex: '#c0392b', lbl: 'Merah' },
  { hex: '#0d9268', lbl: 'Hijau' }, { hex: '#d97706', lbl: 'Kuning' },
  { hex: '#7c3aed', lbl: 'Ungu' }, { hex: '#0891b2', lbl: 'Tosca' },
  { hex: '#e67e22', lbl: 'Oranye' }, { hex: '#e91e63', lbl: 'Pink' },
  { hex: '#607d8b', lbl: 'Abu' }, { hex: '#1a1a2e', lbl: 'Hitam' },
  { hex: '#f59e0b', lbl: 'Emas' }, { hex: '#10b981', lbl: 'Zamrud' }
];

interface DrawMetaModalProps {
  show: boolean;
  showMetaMsr: boolean;
  metaMsrText: string;
  metaNama: string;
  setMetaNama: (val: string) => void;
  metaKet: string;
  setMetaKet: (val: string) => void;
  metaWarna: string;
  setMetaWarna: (val: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const DrawMetaModal: React.FC<DrawMetaModalProps> = ({
  show,
  showMetaMsr,
  metaMsrText,
  metaNama,
  setMetaNama,
  metaKet,
  setMetaKet,
  metaWarna,
  setMetaWarna,
  onSave,
  onCancel
}) => {
  return (
    <div className={`absolute bottom-0 left-0 right-0 z-[1100] rounded-b-[12px] border-t border-border bg-card px-4 pb-4 pt-3.5 shadow-[0_-4px_16px_rgba(0,0,0,0.1)] [transition:transform_.22s_cubic-bezier(.34,1.4,.64,1)] max-md:rounded-none ${show ? 'translate-y-0' : 'translate-y-full'}`}>
      <div className="mb-2.5 flex items-center gap-1.5 text-[.65rem] font-extrabold uppercase tracking-[.1em] text-text">
        <PenTool className="w-4 h-4 inline-block align-middle mr-1.5" /> Tambah Detail Gambar
      </div>
      {showMetaMsr && (
        <div className="mb-2.5 flex items-center gap-1.5 rounded-[7px] border border-[rgba(30,111,217,.25)] bg-bluelo px-2.5 py-[7px] text-[.66rem] text-blue">
          <Ruler className="w-4 h-4 inline-block align-middle" />
          <span>{metaMsrText}</span>
        </div>
      )}
      <div className="mb-2 grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-[.58rem] font-bold uppercase tracking-[.06em] text-muted">
            Nama <span className="text-red">*</span>
          </label>
          <input
            className="w-full rounded-[7px] border border-border bg-bg px-[9px] py-[7px] text-[.72rem] text-text outline-none [transition:border-color_.14s,background_.14s] placeholder:text-muted focus:border-blue focus:bg-bluelo"
            placeholder="Nama garis / area..."
            maxLength={80}
            value={metaNama}
            onChange={(e) => setMetaNama(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-[.58rem] font-bold uppercase tracking-[.06em] text-muted">
            Keterangan
          </label>
          <input
            className="w-full rounded-[7px] border border-border bg-bg px-[9px] py-[7px] text-[.72rem] text-text outline-none [transition:border-color_.14s,background_.14s] placeholder:text-muted focus:border-blue focus:bg-bluelo"
            placeholder="Deskripsi singkat..."
            maxLength={120}
            value={metaKet}
            onChange={(e) => setMetaKet(e.target.value)}
          />
        </div>
      </div>
      <label className="mb-[5px] block text-[.58rem] font-bold uppercase tracking-[.06em] text-muted">
        Warna
      </label>
      <div className="mb-2.5 flex flex-wrap gap-[5px]">
        {DRAW_WARNA_PRESET.map((p) => (
          <div
            key={p.hex}
            className={`h-[22px] w-[22px] shrink-0 cursor-pointer rounded-[5px] border-[2.5px] [transition:transform_.12s,border-color_.12s] hover:scale-[1.18] ${metaWarna === p.hex ? 'scale-[1.18] border-text' : 'border-transparent'}`}
            style={{ backgroundColor: p.hex }}
            onClick={() => setMetaWarna(p.hex)}
            title={p.lbl}
          ></div>
        ))}
      </div>
      <div className="mb-2.5 flex items-center gap-1.5">
        <input
          type="color"
          className="h-7 w-7 cursor-pointer rounded-[5px] border-none bg-transparent p-0"
          value={metaWarna}
          onChange={(e) => setMetaWarna(e.target.value)}
        />
        <span className="font-mono text-[.62rem] text-muted">{metaWarna}</span>
      </div>
      <div className="flex gap-1.5">
        <button className="flex flex-1 cursor-pointer items-center justify-center gap-[5px] rounded-lg bg-blue px-[7px] py-[7px] text-[.72rem] font-extrabold text-white hover:bg-blueh" onClick={onSave}>
          <Check className="w-4 h-4 inline-block align-middle" /> Tambahkan ke Peta
        </button>
        <button className="cursor-pointer rounded-lg border border-border bg-bg px-3 py-[7px] text-[.72rem] font-bold text-mid" onClick={onCancel}>
          Batal
        </button>
      </div>
    </div>
  );
};
