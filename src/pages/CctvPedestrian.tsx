import React, { useState } from 'react';
import { CctvSkeleton } from '../components/SkeletonPages';

export const CctvPedestrian: React.FC = () => {
  // URL embed diambil dari env (vite define) — tidak ada hardcode di source.
  const [iframeUrl] = useState(process.env.CCTV_URL || '');
  const [loaded, setLoaded] = useState(false);

  if (!loaded) {
    // Keep iframe hidden in background to start loading
    return (
      <>
        <CctvSkeleton />
        <iframe
          title="CCTV Loading Hidden"
          src={iframeUrl}
          onLoad={() => setLoaded(true)}
          className="hidden"
        />
      </>
    );
  }

  return (
    <div className="relative flex h-[calc(100vh-96px)] w-full flex-col overflow-hidden rounded-xl border border-border bg-card max-md:h-[calc(100vh-88px)]">
      <iframe
        title="CCTV Pedestrian Ponorogo"
        src={iframeUrl}
        loading="eager"
        referrerPolicy="no-referrer-when-downgrade"
        allow="camera; microphone; geolocation; fullscreen"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
        className="block h-full w-full flex-1 border-none"
      />
    </div>
  );
};

export default CctvPedestrian;
