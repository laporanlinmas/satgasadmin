import React from 'react';
import { useAuth } from '../App';
import { InputSkeleton } from '../components/SkeletonPages';

/**
 * Menu Input Laporan ditampilkan sebagai iframe penuh dari aplikasi
 * pelaporan (laporsipedas.vercel.app). URL diambil dari environment
 * variable `IFRAME_LAPOR_URL` agar tidak ada yang hardcode.
 */
const IFRAME_URL: string = process.env.IFRAME_LAPOR_URL || '';

const InputLaporanContent: React.FC = () => {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <div className="p-5 text-center text-muted">
        <h2>Akses Ditolak</h2>
        <p>Anda tidak memiliki izin (Admin) untuk membuat laporan.</p>
      </div>
    );
  }

  if (!IFRAME_URL) {
    return <InputSkeleton />;
  }

  return (
    <iframe
      src={IFRAME_URL}
      title="Input Laporan SIPEDAS"
      className="block h-[calc(100vh-120px)] w-full rounded-xl border-none bg-white"
      allow="camera; geolocation; microphone"
      allowFullScreen
    />
  );
};

export const InputLaporan: React.FC = () => <InputLaporanContent />;

export default InputLaporan;
