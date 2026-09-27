import React from 'react';
import { Camera, Layers, EyeOff, Route, Map, Footprints, Shield, HeartPulse, Flame, UsersRound, Folder } from 'lucide-react';

export const normalizeKategori = (raw?: string): string => {
  if (!raw) return 'pedestrian';
  const s = raw.toLowerCase().trim();
  if (s === 'yanma' || s === 'yanmas' || s.includes('yanma') || s.includes('pelayanan')) return 'yanmas';
  if (s === 'poskamling' || s.includes('kamling')) return 'poskamling';
  if (s === 'posyandu' || s.includes('yandu')) return 'posyandu';
  if (s === 'kebencanaan' || s.includes('bencana')) return 'kebencanaan';
  if (s === 'lainnya' || s.includes('lain')) return 'lainnya';
  if (s === 'pedestrian') return 'pedestrian';
  return 'pedestrian';
};

export const SATGAS_KATEGORI_LIST = [
  { id: 'pedestrian', label: 'Pedestrian', ico: Footprints, warna: '#1e6fd9' },
  { id: 'poskamling', label: 'Poskamling', ico: Shield, warna: '#6366f1' },
  { id: 'posyandu', label: 'Posyandu', ico: HeartPulse, warna: '#ec4899' },
  { id: 'kebencanaan', label: 'Kebencanaan', ico: Flame, warna: '#ef4444' },
  { id: 'yanmas', label: 'Pelayanan Masyarakat', ico: UsersRound, warna: '#10b981' },
  { id: 'lainnya', label: 'Lainnya', ico: Folder, warna: '#8b5cf6' },
];

const STREET_BOUNDS = [
  { id: 'diponegoro', minLat: -7.872245, maxLat: -7.864721, minLng: 111.460848, maxLng: 111.461663 },
  { id: 'jenderal_soedirman', minLat: -7.872330, maxLat: -7.871480, minLng: 111.461556, maxLng: 111.470525 },
  { id: 'hos_cokroaminoto',   minLat: -7.871501, maxLat: -7.864891, minLng: 111.469452, maxLng: 111.470504 },
  { id: 'urip_soemoharjo',    minLat: -7.865167, maxLat: -7.864636, minLng: 111.461256, maxLng: 111.469474 }
];

export const JALAN_GROUPS = [
  { id: 'diponegoro',         label: 'Jl. Diponegoro',         ico: 'fa-road',             warna: '#c0392b' },
  { id: 'jenderal_soedirman', label: 'Jl. Jenderal Soedirman', ico: 'fa-road',             warna: '#607d8b' },
  { id: 'hos_cokroaminoto',   label: 'Jl. HOS Cokroaminoto',   ico: 'fa-road',             warna: '#0d9268' },
  { id: 'urip_soemoharjo',    label: 'Jl. Urip Soemoharjo',    ico: 'fa-road',             warna: '#d97706' },
  { id: 'lainnya',            label: 'Area Lainnya',           ico: 'fa-map-location-dot', warna: '#1e6fd9' }
];

const getStreetBoundsByCoords = (lat: number, lng: number) => {
  if (!lat || !lng) return 'lainnya';
  for (let i = 0; i < STREET_BOUNDS.length; i++) {
    const b = STREET_BOUNDS[i];
    if (lat >= b.minLat && lat <= b.maxLat && lng >= b.minLng && lng <= b.maxLng) return b.id;
  }
  return 'lainnya';
};

export const resolveKelompok = (pt: any) => {
  if (pt.lat && pt.lng) {
    const streetId = getStreetBoundsByCoords(pt.lat, pt.lng);
    if (streetId !== 'lainnya') return streetId;
  }
  return 'lainnya';
};

const getJalanIcon = (ico: string, className = "w-3.5 h-3.5") => {
  switch (ico) {
    case 'fa-road':
      return <Route className={className} />;
    case 'fa-map-location-dot':
      return <Map className={className} />;
    default:
      return <Map className={className} />;
  }
};

export interface StreetPhotoPanelProps {
  isStreetPanelOpen: boolean;
  setIsStreetPanelOpen: (open: boolean) => void;
  streetFilter: string | null;
  setStreetFilter: (filter: string | null) => void;
  kategoriFilter: string;
  setKategoriFilter: (kat: string) => void;
  showPhotos: boolean;
  setShowPhotos: (show: boolean) => void;
  photosList: any[];
}

export const StreetPhotoPanel: React.FC<StreetPhotoPanelProps> = ({
  isStreetPanelOpen,
  setIsStreetPanelOpen,
  streetFilter,
  setStreetFilter,
  kategoriFilter,
  setKategoriFilter,
  showPhotos,
  setShowPhotos,
  photosList
}) => {
  const validPhotos = photosList.filter((p) => p.lat && p.lng);

  return (
    <>
      {/* Bottom Left: Foto Lapangan Controls */}
      <button
        className={`absolute bottom-[30px] left-[10px] z-[999] flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border text-[.88rem] transition-all duration-[150ms] hover:scale-[1.08] hover:border-blueh hover:bg-blue hover:text-white ${isStreetPanelOpen ? 'border-blueh bg-blue text-white shadow-[0_0_0_2px_var(--card),0_0_0_4px_var(--blue)]' : 'border-border bg-card text-text shadow-[var(--sh)]'}`}
        onClick={() => setIsStreetPanelOpen(!isStreetPanelOpen)}
        title="Kategori & Sebaran Foto Kegiatan Satgas"
      >
        <Camera className="w-4 h-4 inline-block align-middle" />
      </button>

      {/* DF Street Panel (Foto Lapangan Category Filter) at bottom-left */}
      <div className={`absolute bottom-[74px] left-[10px] z-[1000] flex max-h-[60vh] min-w-[225px] origin-bottom-left flex-col gap-[1px] overflow-y-auto rounded-[14px] border border-border bg-card px-[6px] py-[7px] shadow-[var(--shl)] backdrop-blur-[18px] [transition:opacity_.18s_ease,transform_.18s_ease] max-md:bottom-[70px] max-md:max-h-[50vh] max-md:min-w-[195px] max-md:text-[.65rem] ${isStreetPanelOpen ? 'pointer-events-auto opacity-100 scale-100 translate-y-0' : 'pointer-events-none opacity-0 scale-[.88] translate-y-2'}`}>
        <div className="px-2.5 pb-[5px] pt-[3px] text-[.52rem] font-extrabold uppercase tracking-[.12em] text-muted">Sebaran Foto Satgas</div>
        
        {/* Semua Foto */}
        <button
          className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-[7px] text-left text-[.68rem] font-bold [transition:background_.12s,color_.12s] ${kategoriFilter === 'semua' && streetFilter === null && showPhotos ? 'bg-bluelo text-blue' : 'bg-transparent text-text hover:bg-border'}`}
          onClick={() => {
            setKategoriFilter('semua');
            setStreetFilter(null);
            setShowPhotos(true);
            setIsStreetPanelOpen(false);
          }}
        >
          <Layers className="mr-1 w-3.5 h-3.5 inline-block align-middle text-blue" /> Semua Kategori
          <span className={`ml-auto rounded-[20px] px-1.5 py-px font-mono text-[.58rem] ${kategoriFilter === 'semua' && streetFilter === null && showPhotos ? 'bg-blue text-white' : 'bg-border text-mid'}`}>{validPhotos.length}</span>
        </button>

        {showPhotos && (
          <button
            className="flex w-full cursor-pointer items-center gap-2 rounded-lg bg-transparent px-2.5 py-[6px] text-left text-[.68rem] font-bold text-text [transition:background_.12s,color_.12s] hover:bg-border"
            onClick={() => {
              setShowPhotos(false);
              setIsStreetPanelOpen(false);
            }}
          >
            <EyeOff className="mr-1 w-3.5 h-3.5 inline-block align-middle text-muted" /> Sembunyikan Titik
          </button>
        )}

        <div className="mx-[5px] my-[3px] h-px bg-border"></div>
        <div className="px-2.5 pb-[4px] pt-[3px] text-[.52rem] font-extrabold uppercase tracking-[.12em] text-muted">Per Kategori Kegiatan</div>

        {SATGAS_KATEGORI_LIST.map((kat) => {
          const KatIco = kat.ico;
          const count = validPhotos.filter((pt) => normalizeKategori(pt.kategori) === kat.id).length;
          const isA = kategoriFilter === kat.id && streetFilter === null && showPhotos;

          return (
            <button
              key={kat.id}
              className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-[6px] text-left text-[.68rem] font-bold [transition:background_.12s,color_.12s] ${isA ? 'bg-bluelo text-blue' : 'bg-transparent text-text hover:bg-border'}`}
              onClick={() => {
                setKategoriFilter(kat.id);
                setStreetFilter(null);
                setShowPhotos(true);
                setIsStreetPanelOpen(false);
              }}
            >
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded" style={{ color: kat.warna }}>
                <KatIco className="w-3.5 h-3.5" />
              </span>
              <span className="truncate">{kat.label}</span>
              <span
                className={`ml-auto rounded-[20px] px-1.5 py-px font-mono text-[.58rem] ${isA ? 'bg-blue text-white' : 'bg-border text-mid'}`}
                style={{ opacity: count ? 1 : 0.35 }}
              >
                {count}
              </span>
            </button>
          );
        })}

        {/* Section Khusus Pedestrian Jalan */}
        <div className="mx-[5px] my-[3px] h-px bg-border"></div>
        <div className="px-2.5 pb-[4px] pt-[3px] text-[.52rem] font-extrabold uppercase tracking-[.12em] text-muted">Jalan Pedestrian</div>

        {JALAN_GROUPS.map((g) => {
          const count = validPhotos.filter((pt) => normalizeKategori(pt.kategori) === 'pedestrian' && resolveKelompok(pt) === g.id).length;
          const isA = kategoriFilter === 'pedestrian' && streetFilter === g.id && showPhotos;
          return (
            <button
              key={g.id}
              className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-[6px] text-left text-[.68rem] font-bold [transition:background_.12s,color_.12s] ${isA ? 'bg-bluelo text-blue' : 'bg-transparent text-text hover:bg-border'}`}
              onClick={() => {
                setKategoriFilter('pedestrian');
                setStreetFilter(g.id);
                setShowPhotos(true);
                setIsStreetPanelOpen(false);
              }}
            >
              <span className="shrink-0" style={{ color: g.warna }}>
                {getJalanIcon(g.ico)}
              </span>
              <span className="truncate">{g.label.replace('Jl. ', '')}</span>
              <span
                className={`ml-auto rounded-[20px] px-1.5 py-px font-mono text-[.58rem] ${isA ? 'bg-blue text-white' : 'bg-border text-mid'}`}
                style={{ opacity: count ? 1 : 0.35 }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
};
