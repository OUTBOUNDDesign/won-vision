'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ACTIVE_STATUSES = new Set(['queued', 'processing']);

export function AutoRefresh({ status, intervalMs = 5000 }: { status: string; intervalMs?: number }) {
  const router = useRouter();
  const active = ACTIVE_STATUSES.has(status);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [active, router, intervalMs]);

  if (!active) return null;

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      fontSize: 11,
      fontWeight: 500,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color: '#000',
      padding: '6px 10px',
      border: '1px solid #000',
      background: '#fff',
    }}>
      <span
        aria-hidden
        style={{
          width: 8,
          height: 8,
          background: '#000',
          borderRadius: '50%',
          animation: 'wv-pulse 1.4s ease-in-out infinite',
        }}
      />
      Live · refreshing every {Math.round(intervalMs / 1000)}s
      <style>{`@keyframes wv-pulse { 0%,100% { opacity:1 } 50% { opacity:0.25 } }`}</style>
    </div>
  );
}
