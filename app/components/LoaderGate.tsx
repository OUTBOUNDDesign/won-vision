'use client';

import { useEffect, useState } from 'react';
import WonVisionLoader from './WonVisionLoader';

const STORAGE_KEY = 'wv-entered';

export default function LoaderGate() {
  // Start hidden on the server / first paint to avoid an SSR flash, then
  // decide on the client whether the user has already seen the loader.
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === '1') return;
    setShow(true);
  }, []);

  if (!show) return null;

  return (
    <WonVisionLoader
      onComplete={() => {
        sessionStorage.setItem(STORAGE_KEY, '1');
      }}
    />
  );
}
