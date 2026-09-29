import React from 'react';
import { ExternalLink } from 'lucide-react';
import { useAuth } from '../App';
import { InputSkeleton } from '../components/SkeletonPages';

/** URL aplikasi pelaporan terpisah; dibuka langsung agar tidak diblokir sebagai iframe. */
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
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center">
      <a
        href={IFRAME_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-md bg-blue px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-blueh"
      >
        <ExternalLink className="h-4 w-4" />
        Buka Form Input SIPEDAS
      </a>
    </div>
  );
};

export const InputLaporan: React.FC = () => <InputLaporanContent />;

export default InputLaporan;
