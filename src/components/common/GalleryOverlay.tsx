import { ChevronLeft, ChevronRight, Loader2, ExternalLink, Download } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useApp } from '../../App';
import { makeDriveThumbUrl } from '../../utils/helpers';

/** Ekstrak ID file Google Drive dari berbagai format URL Drive. */
const extractDriveId = (url: string): string | null => {
  if (!url) return null;
  const m1 = /[?&]id=([^&]+)/.exec(url);
  if (m1) return m1[1];
  const m2 = /\/file\/d\/([^/?]+)/.exec(url);
  if (m2) return m2[1];
  return null;
};

/** URL unduhan langsung (Drive pakai endpoint `uc?export=download`). */
const buildDownloadUrl = (url: string): string => {
  const id = extractDriveId(url);
  if (id) return `https://drive.google.com/uc?export=download&id=${id}`;
  return url;
};

export const GalleryOverlay: React.FC = () => {
  const { gallery, galleryNav, closeGallery } = useApp();
  const [imgSrc, setImgSrc] = useState<string>('');
  const [isImgLoading, setIsImgLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  const activeFoto = gallery.fotos[gallery.index] || '';
  const activeThumb = gallery.thumbs[gallery.index] || activeFoto;

  useEffect(() => {
    if (gallery.show && activeThumb) {
      setImgSrc(activeThumb);
      setIsImgLoading(true);
      setHasError(false);
    }
  }, [gallery.show, gallery.index, activeThumb]);

  if (!gallery.show) return null;

  const handleImgLoad = () => {
    setIsImgLoading(false);
  };

  const handleImgError = () => {
    setIsImgLoading(false);
    if (!hasError && activeFoto) {
      const parsedFoto = activeFoto.includes('drive.google.com') ? makeDriveThumbUrl(activeFoto) : activeFoto;
      if (imgSrc !== parsedFoto) {
        setHasError(true);
        setImgSrc(parsedFoto);
        return;
      }
    }
    // Final placeholder fallback
    setImgSrc(
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect width="300" height="200" fill="%23222"%2F%3E%3Ctext x="150" y="110" text-anchor="middle" fill="%23777" font-size="13" font-family="sans-serif"%3EGambar tidak dapat dimuat%3C%2Ftext%3E%3C%2Fsvg%3E'
    );
  };

  const showDriveLink = activeFoto && activeFoto.includes('drive.google.com');

  return (
    <div id="gov" className="on fixed inset-0 z-[99980] flex flex-col items-center justify-center gap-[9px] bg-[rgba(0,0,0,.96)] p-3.5 print:hidden">
      <button id="gcl" className="absolute right-4 top-[14px] z-[1] border-none bg-transparent text-[1.6rem] leading-none text-white opacity-[.55] transition-opacity duration-[140ms] hover:opacity-100" onClick={closeGallery}>
        &times;
      </button>
      <div id="gcnt" className="font-mono text-[.68rem] text-[rgba(255,255,255,.45)]">
        {gallery.index + 1} / {gallery.fotos.length}
      </div>

      {isImgLoading && (
        <div id="gloaderOverlay" className="on absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-[7px] text-[.74rem] text-[rgba(255,255,255,.5)]">
          <Loader2 className="w-4 h-4 inline-block align-middle animate-spin" /> Memuat...
        </div>
      )}

      <div className="flex items-center gap-[9px] max-w-[90vw]">
        <button
          className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full border-none bg-[rgba(255,255,255,.1)] text-[.9rem] text-white transition-colors duration-[140ms] hover:bg-[rgba(255,255,255,.2)] disabled:pointer-events-none disabled:opacity-[.14]"
          id="gpv"
          onClick={() => galleryNav(-1)}
          disabled={gallery.index === 0}
        >
          <ChevronLeft className="w-4 h-4 inline-block align-middle" />
        </button>
        <img
          id="gimg"
          src={imgSrc}
          alt="Gallery item"
          onError={handleImgError}
          onLoad={handleImgLoad}
          className="block max-h-[62vh] max-w-[76vw] rounded-[9px] shadow-[0_18px_56px_rgba(0,0,0,.6)] object-contain"
          style={{ display: isImgLoading ? 'none' : 'block' }}
        />
        <button
          className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full border-none bg-[rgba(255,255,255,.1)] text-[.9rem] text-white transition-colors duration-[140ms] hover:bg-[rgba(255,255,255,.2)] disabled:pointer-events-none disabled:opacity-[.14]"
          id="gnx"
          onClick={() => galleryNav(1)}
          disabled={gallery.index === gallery.fotos.length - 1}
        >
          <ChevronRight className="w-4 h-4 inline-block align-middle" />
        </button>
      </div>

      <div id="gths" className="mt-1 flex max-w-[84vw] flex-wrap justify-center gap-[5px]">
        {gallery.thumbs.map((thumbUrl, idx) => (
          <img
            key={idx}
            src={thumbUrl}
            className={`h-9 w-[46px] cursor-pointer rounded-md border-2 object-cover transition-all duration-[140ms] ${idx === gallery.index ? 'border-white opacity-100' : 'border-transparent opacity-[.45]'}`}
            onClick={() => useApp().openGallery(gallery.fotos, gallery.thumbs, idx)}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.opacity = '0.15';
            }}
            alt={`Thumb ${idx + 1}`}
          />
        ))}
      </div>

      <div
        id="gdrvlink"
        className="mt-1.5 flex flex-wrap justify-center gap-1.5"
      >
        <a
          href={buildDownloadUrl(activeFoto)}
          id="gdrvhref"
          download
          target="_blank"
          rel="noopener noreferrer"
          title="Unduh foto ini"
          className="inline-flex items-center gap-[5px] rounded-[20px] border border-[rgba(255,255,255,.14)] px-[11px] py-1 text-[.66rem] text-[rgba(255,255,255,.5)] no-underline transition-all duration-[140ms] hover:border-[rgba(255,255,255,.38)] hover:bg-[rgba(255,255,255,.07)] hover:text-white"
        >
          <Download className="w-4 h-4 inline-block align-middle mr-1.5" /> Unduh
        </a>
        {showDriveLink && (
          <a
            href={activeFoto}
            target="_blank"
            rel="noopener noreferrer"
            title="Buka di Google Drive"
            className="inline-flex items-center gap-[5px] rounded-[20px] border border-[rgba(255,255,255,.14)] px-[11px] py-1 text-[.66rem] text-[rgba(255,255,255,.5)] no-underline transition-all duration-[140ms] hover:border-[rgba(255,255,255,.38)] hover:bg-[rgba(255,255,255,.07)] hover:text-white"
          >
            <ExternalLink className="w-4 h-4 inline-block align-middle mr-1.5" /> Google Drive
          </a>
        )}
      </div>
    </div>
  );
};
