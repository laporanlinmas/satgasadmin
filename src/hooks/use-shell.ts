import { useEffect, useState } from 'react';

/**
 * True bila viewport = potret ponsel (≤768px dan potret).
 * Satu-satunya breakpoint yang mengubah bentuk shell (sidebar off-canvas,
 * margin konten, hamburger, bottom behavior). Dipakai AppLayout/Sidebar —
 * bagian shell yang nilainya harus sinkron antar komponen (state-driven).
 * Breakpoint per elemen lain diekspresikan langsung dengan varian
 * Tailwind (`portrait:max-md:...`) di TSX masing-masing.
 */
const PHONE_PORTRAIT = '(max-width: 768px) and (orientation: portrait)';

export function usePhonePortrait(): boolean {
  const [isPhonePortrait, setIsPhonePortrait] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(PHONE_PORTRAIT).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia(PHONE_PORTRAIT);
    const onChange = () => setIsPhonePortrait(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return isPhonePortrait;
}

export default usePhonePortrait;
