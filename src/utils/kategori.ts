/**
 * Sumber kebenaran kategori laporan untuk seluruh admin.
 * Dipakai sub menu sidebar (Rekap Laporan → percabangan kolaps), filter &
 * identitas halaman Rekap, dan tampilan label — supaya tidak ada label ganda.
 *
 * Metadata `description`/`tone`/`icon`/`flow` disinkronkan dengan aplikasi
 * pelaporan (sipedas mobile) di `satgas/src/lib/constants.ts` → `CATEGORIES`.
 * Baris Spreadsheet tanpa kategori = Pedestrian (aturan data yang sama).
 */

/** Jenis alur kerja kategori — sama dgn mobile: pedestrian vs structured. */
export type KategoriFlow = 'pedestrian' | 'structured';
/** Warna aksen kategori — sama dgn `CategoryTone` di mobile. */
export type KategoriTone = 'teal' | 'amber' | 'rose' | 'orange' | 'blue' | 'violet';
/** Nama ikon kategori — sama dgn `CategoryIcon` di mobile (dipetakan ke lucide). */
export type KategoriIconName = 'shield' | 'landmark' | 'heart' | 'flame' | 'users' | 'briefcase';

export interface KategoriDef {
  slug: string;
  label: string;
  /** Deskripsi singkat — sama dgn landing card sipedas mobile. */
  description: string;
  tone: KategoriTone;
  icon: KategoriIconName;
  flow: KategoriFlow;
}

export const KATEGORI_LIST: KategoriDef[] = [
  {
    slug: 'pedestrian',
    label: 'Pedestrian',
    description: 'Patroli & aksi lapangan',
    tone: 'teal',
    icon: 'shield',
    flow: 'pedestrian',
  },
  {
    slug: 'poskamling',
    label: 'Poskamling',
    description: 'Aktivitas keamanan & vigilant lingkungan',
    tone: 'amber',
    icon: 'landmark',
    flow: 'structured',
  },
  {
    slug: 'posyandu',
    label: 'Posyandu',
    description: 'Layanan kesehatan & gizi masyarakat',
    tone: 'rose',
    icon: 'heart',
    flow: 'structured',
  },
  {
    slug: 'kebencanaan',
    label: 'Kebencanaan',
    description: 'Kesiapsiagaan & penanganan bencana',
    tone: 'orange',
    icon: 'flame',
    flow: 'structured',
  },
  {
    slug: 'yanmas',
    label: 'Pelayanan Masyarakat',
    description: 'Layanan & kegiatan warga',
    tone: 'blue',
    icon: 'users',
    flow: 'structured',
  },
  {
    slug: 'lainnya',
    label: 'Lainnya',
    description: 'Kegiatan satgas lainnya',
    tone: 'violet',
    icon: 'briefcase',
    flow: 'structured',
  },
];

/** Bentuk record (slug → label) untuk kebutuhan lookup/iterasi. */
export const KATEGORI_LABEL: Record<string, string> = Object.fromEntries(
  KATEGORI_LIST.map((k) => [k.slug, k.label])
);

/** Definisi lengkap per slug; guard untuk slug tak dikenal. */
export const kategoriBySlug = (slug: string): KategoriDef =>
  KATEGORI_LIST.find((k) => k.slug === slug) ?? KATEGORI_LIST[0];

/** Nama tampilan kategori; slug kosong/tanpa kategori = Pedestrian. */
export const kategoriLabel = (k?: string | null): string => {
  if (!k) return 'Pedestrian';
  return KATEGORI_LABEL[k] || k.charAt(0).toUpperCase() + k.slice(1);
};
