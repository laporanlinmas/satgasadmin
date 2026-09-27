import { Plus, Edit, Trash2, Crosshair, Save, Layers, Eye, EyeOff, MousePointerClick, Route, AlertTriangle, Shield, Store, Map, Building, Video, Square } from 'lucide-react';
import React from 'react';
import { LayerPeta } from '../../types';
import { esc } from '../../utils/helpers';
import { Modal } from '../common/Modal';

interface PtkSimbol {
  id: string;
  ico: string;
  label: string;
  warna: string;
}

interface EditLayersModalProps {
  show: boolean;
  onClose: () => void;
  layersList: LayerPeta[];
  SIMBOL_DEF: PtkSimbol[];
  DRAW_WARNA_PRESET: Array<{ hex: string; lbl: string }>;
  
  layerFormOpen: boolean;
  setLayerFormOpen: (open: boolean) => void;
  editingLayer: LayerPeta | null;
  
  layerFormNama: string;
  setLayerFormNama: (val: string) => void;
  layerFormDeskripsi: string;
  setLayerFormDeskripsi: (val: string) => void;
  layerFormSimbol: string;
  setLayerFormSimbol: (val: string) => void;
  layerFormWarna: string;
  setLayerFormWarna: (val: string) => void;
  layerFormLat: string;
  setLayerFormLat: (val: string) => void;
  layerFormLng: string;
  setLayerFormLng: (val: string) => void;
  
  openLayerForm: (layer: LayerPeta | null) => void;
  handleToggleLayerActive: (layer: LayerPeta) => void;
  setShowConfirmDeleteLayer: (id: string | number | null) => void;
  triggerPickCoordinate: () => void;
  handleSubmitLayerForm: () => void;
}

const getSimbolIcon = (ico: string, className = "w-4 h-4") => {
  switch (ico) {
    case 'fa-route':
    case 'fa-road':
      return <Route className={className} />;
    case 'fa-triangle-exclamation':
      return <AlertTriangle className={className} />;
    case 'fa-shield-halved':
      return <Shield className={className} />;
    case 'fa-store':
      return <Store className={className} />;
    case 'fa-draw-polygon':
    case 'fa-map-location-dot':
      return <Map className={className} />;
    case 'fa-building':
      return <Building className={className} />;
    case 'fa-video':
      return <Video className={className} />;
    case 'fa-square-parking':
      return <Square className={className} />;
    default:
      return <Map className={className} />;
  }
};

export const EditLayersModal: React.FC<EditLayersModalProps> = ({
  show,
  onClose,
  layersList,
  SIMBOL_DEF,
  DRAW_WARNA_PRESET,
  
  layerFormOpen,
  setLayerFormOpen,
  editingLayer,
  
  layerFormNama,
  setLayerFormNama,
  layerFormDeskripsi,
  setLayerFormDeskripsi,
  layerFormSimbol,
  setLayerFormSimbol,
  layerFormWarna,
  setLayerFormWarna,
  layerFormLat,
  setLayerFormLat,
  layerFormLng,
  setLayerFormLng,
  
  openLayerForm,
  handleToggleLayerActive,
  setShowConfirmDeleteLayer,
  triggerPickCoordinate,
  handleSubmitLayerForm
}) => {
  return (
    <Modal
      show={show}
      onClose={onClose}
      size="xl"
      widthClass="w-full max-w-[720px] portrait:max-md:w-[calc(100vw-20px)]"
      title={
        <>
          <Layers className="w-4 h-4 inline-block align-middle mr-1.5 text-[var(--teal)]" /> Edit Layer Peta Satgas
        </>
      }
      footer={
        <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-[15px] py-2 text-[.74rem] font-semibold text-mid transition-all duration-200 hover:-translate-y-px hover:border-bdark hover:bg-bg hover:text-text" onClick={onClose}>
          Tutup
        </button>
      }
    >
      <div className="-mx-[18px] -my-4 grid h-[68vh] min-h-[400px] grid-cols-2">
            
            {/* Left side: layer list */}
            <div className="overflow-y-auto border-r border-border bg-bg p-3">
              <div className="mb-[9px] flex items-center justify-between">
                <p className="text-[.67rem] font-extrabold uppercase tracking-[.06em] text-mid">
                  Daftar Layer
                </p>
                <button className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-blue px-2.5 py-[5px] text-[.63rem] font-bold text-white transition-all duration-200 hover:-translate-y-px hover:bg-blueh active:translate-y-0" onClick={() => openLayerForm(null)}>
                  <Plus className="w-4 h-4 inline-block align-middle" /> Tambah
                </button>
              </div>
              <div id="layer-list-body">
                {layersList.length === 0 ? (
                  <div className="px-2.5 py-10 text-center text-muted">
                    <Layers className="w-8 h-8 opacity-[0.14] mx-auto mb-2 block" />
                    <p className="text-[.72rem]">Tidak ada layer.</p>
                  </div>
                ) : (
                  layersList.map((layer) => {
                    const sd = SIMBOL_DEF.find((s) => s.id === layer.simbol) || SIMBOL_DEF[0];
                    return (
                      <div key={layer._ri} className={`mb-1.5 flex items-center gap-2 rounded-[9px] border border-border bg-card px-[11px] py-[9px] transition-all duration-[150ms] hover:shadow-[var(--sh0)] ${layer.aktif ? '' : 'opacity-45'}`}>
                        <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[7px] text-[.85rem]" style={{ background: `${layer.warna || sd.warna}22`, color: layer.warna || sd.warna }}>
                          {getSimbolIcon(sd.ico, "w-4 h-4")}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[.76rem] font-bold text-text">{esc(layer.nama)}</div>
                          <div className="mt-px text-[.6rem] text-muted">
                            {sd.label} · {layer.aktif ? <span className="text-green">Aktif</span> : <span className="text-muted">Nonaktif</span>}
                          </div>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <button
                            className="flex h-[22px] w-[22px] cursor-pointer items-center justify-center rounded-[5px] border-none text-[.56rem] transition-all duration-[130ms]"
                            style={{ background: layer.aktif ? 'var(--greenl)' : 'var(--bg)', color: layer.aktif ? 'var(--green)' : 'var(--muted)' }}
                            onClick={() => handleToggleLayerActive(layer)}
                            title="Toggle Aktif"
                          >
                            {layer.aktif ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <button className="flex h-[22px] w-[22px] cursor-pointer items-center justify-center rounded-[5px] border-none bg-bluelo text-[.56rem] text-blue transition-all duration-[130ms] hover:bg-blue hover:text-white" onClick={() => openLayerForm(layer)} title="Edit">
                            <Edit className="w-4 h-4 inline-block align-middle" />
                          </button>
                          <button className="flex h-[22px] w-[22px] cursor-pointer items-center justify-center rounded-[5px] border-none bg-redl text-[.56rem] text-red transition-all duration-[130ms] hover:bg-red hover:text-white" onClick={() => setShowConfirmDeleteLayer(layer._ri)} title="Hapus">
                            <Trash2 className="w-4 h-4 inline-block align-middle" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right side: layer edit form */}
            <div className="overflow-y-auto p-3">
              {layerFormOpen ? (
                <div>
                  <p className="mb-2.5 text-[.7rem] font-extrabold uppercase text-mid">
                    {editingLayer ? 'Edit Layer' : 'Tambah Layer Baru'}
                  </p>
                  <div className="mb-2.5">
                    <label className="mb-1 block text-[.62rem] font-extrabold uppercase tracking-[.07em] text-mid">Nama Lokasi / Point</label>
                    <input
                      className="w-full rounded-md border border-border bg-card px-3 py-[9px] text-[.82rem] text-text transition-all duration-200 outline-none focus:border-blue focus:shadow-[0_0_0_3px_var(--bluelo)]"
                      value={layerFormNama}
                      onChange={(e) => setLayerFormNama(e.target.value)}
                    />
                  </div>
                  <div className="mb-2.5">
                    <label className="mb-1 block text-[.62rem] font-extrabold uppercase tracking-[.07em] text-mid">Keterangan / Deskripsi</label>
                    <input
                      className="w-full rounded-md border border-border bg-card px-3 py-[9px] text-[.82rem] text-text transition-all duration-200 outline-none focus:border-blue focus:shadow-[0_0_0_3px_var(--bluelo)]"
                      value={layerFormDeskripsi}
                      onChange={(e) => setLayerFormDeskripsi(e.target.value)}
                    />
                  </div>
                  
                  {/* Simbol grid selector */}
                  <div className="mb-2.5">
                    <label className="mb-1 block text-[.62rem] font-extrabold uppercase tracking-[.07em] text-mid">Simbol</label>
                    <div className="mb-2.5 grid grid-cols-4 gap-[7px]">
                      {SIMBOL_DEF.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          className={`flex cursor-pointer flex-col items-center gap-1 rounded-[9px] border-2 px-1 py-2 text-[.58rem] font-bold transition-all duration-[150ms] ${layerFormSimbol === s.id ? 'border-teal bg-teall text-teal' : 'border-border bg-bg text-muted hover:border-blue hover:bg-bluelo hover:text-blue'}`}
                          onClick={() => {
                            setLayerFormSimbol(s.id);
                            setLayerFormWarna(s.warna);
                          }}
                        >
                          {getSimbolIcon(s.ico, "w-4 h-4")}
                          <span className="mt-0.5">{s.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Warna Swatches & Custom Picker */}
                  <div className="mb-2.5">
                    <label className="mb-1 block text-[.62rem] font-extrabold uppercase tracking-[.07em] text-mid">Warna Pin</label>
                    <div className="mb-2 flex flex-wrap gap-[5px]">
                      {DRAW_WARNA_PRESET.map((p) => (
                        <div
                          key={p.hex}
                          className={`h-[22px] w-[22px] cursor-pointer rounded-[5px] border-2 [transition:transform_.13s,border-color_.13s] hover:border-text ${layerFormWarna === p.hex ? 'border-text' : 'border-transparent'}`}
                          style={{ backgroundColor: p.hex }}
                          onClick={() => setLayerFormWarna(p.hex)}
                          title={p.lbl}
                        ></div>
                      ))}
                    </div>
                    <div className="flex items-center gap-[7px]">
                      <input
                        type="color"
                        id="lf-warna-inp"
                        value={layerFormWarna}
                        onChange={(e) => setLayerFormWarna(e.target.value)}
                        className="h-[28px] w-[34px] cursor-pointer rounded-[5px] border-none bg-transparent p-0"
                      />
                      <span className="font-mono text-[.68rem] text-mid">
                        {layerFormWarna}
                      </span>
                    </div>
                  </div>

                  <div className="mb-2.5 grid grid-cols-2 items-end gap-2.5 portrait:max-md:grid-cols-1">
                    <div className="flex flex-col gap-0">
                      <label className="mb-1 block text-[.62rem] font-extrabold uppercase tracking-[.07em] text-mid">Latitude</label>
                      <input
                        className="w-full rounded-md border border-border bg-card px-3 py-[9px] text-[.82rem] text-text transition-all duration-200 outline-none focus:border-blue focus:shadow-[0_0_0_3px_var(--bluelo)]"
                        value={layerFormLat}
                        onChange={(e) => setLayerFormLat(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-0">
                      <label className="mb-1 block text-[.62rem] font-extrabold uppercase tracking-[.07em] text-mid">Longitude</label>
                      <input
                        className="w-full rounded-md border border-border bg-card px-3 py-[9px] text-[.82rem] text-text transition-all duration-200 outline-none focus:border-blue focus:shadow-[0_0_0_3px_var(--bluelo)]"
                        value={layerFormLng}
                        onChange={(e) => setLayerFormLng(e.target.value)}
                      />
                    </div>
                    <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-[9px] text-[.74rem] font-semibold text-mid transition-all duration-200 hover:-translate-y-px hover:border-bdark hover:bg-bg hover:text-text" onClick={triggerPickCoordinate} title="Pick dari Peta">
                      <Crosshair className="w-4 h-4 inline-block align-middle" />
                    </button>
                  </div>
                  <div className="mt-3 flex gap-1.5">
                    <button className="inline-flex flex-1 cursor-pointer items-center gap-1.5 rounded-md bg-blue px-4 py-2 text-[.74rem] font-bold text-white transition-all duration-200 hover:-translate-y-px hover:bg-blueh active:translate-y-0" onClick={handleSubmitLayerForm}>
                      <Save className="w-4 h-4 inline-block align-middle" /> Simpan Layer
                    </button>
                    <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-[15px] py-2 text-[.74rem] font-semibold text-mid transition-all duration-200 hover:-translate-y-px hover:border-bdark hover:bg-bg hover:text-text" onClick={() => setLayerFormOpen(false)}>
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-2.5 py-10 text-center text-muted">
                  <MousePointerClick className="w-8 h-8 opacity-[0.14] mx-auto mb-2 block" />
                  <p className="text-[.72rem]">Pilih layer di kiri untuk diedit,<br />atau klik Tambah untuk layer baru.</p>
                </div>
              )}
            </div>

          </div>
    </Modal>
  );
};
