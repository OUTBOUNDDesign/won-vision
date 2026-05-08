/**
 * Won Vision — Logo Loader
 * ─────────────────────────────────────────────────────────────────
 * Outline-then-fill animation:
 *   1. Outlines of W and V trace via stroke-dashoffset
 *   2. Fill fades in (paths become solid)
 *   3. Dot snaps in last with overshoot
 *   4. Mark holds, then fades for clean loop boundary
 *
 * USAGE (App Router, Next.js 13+):
 *
 * 1. Save this file as `components/WonVisionLoader.tsx`
 *
 * 2. Use as a fullscreen splash on first load:
 *
 *    'use client';
 *    import { useEffect, useState } from 'react';
 *    import WonVisionLoader from '@/components/WonVisionLoader';
 *
 *    export default function ClientShell({ children }) {
 *      const [loading, setLoading] = useState(true);
 *      useEffect(() => {
 *        if (sessionStorage.getItem('wv-loaded')) setLoading(false);
 *      }, []);
 *      return loading ? (
 *        <WonVisionLoader onComplete={() => {
 *          sessionStorage.setItem('wv-loaded', '1');
 *          setLoading(false);
 *        }}/>
 *      ) : <>{children}</>;
 *    }
 *
 * PROPS:
 *   duration   — ms per cycle. Default 3000 (matches the GIF).
 *   playOnce   — true = run one cycle then unmount. Default true.
 *   bg         — background colour. Default '#FFFFFF'.
 *   onComplete — fires when the cycle ends (only if playOnce).
 */

'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  duration?: number;
  playOnce?: boolean;
  bg?: string;
  onComplete?: () => void;
}

export default function WonVisionLoader({
  duration = 3000,
  playOnce = true,
  bg = '#FFFFFF',
  onComplete,
}: Props) {
  const [visible, setVisible] = useState(true);
  const fired = useRef(false);

  useEffect(() => {
    if (!playOnce) return;
    const t = setTimeout(() => {
      if (fired.current) return;
      fired.current = true;
      setVisible(false);
      onComplete?.();
    }, duration);
    return () => clearTimeout(t);
  }, [duration, playOnce, onComplete]);

  if (!visible) return null;

  const styleVars = { '--wv-duration': `${duration}ms` } as React.CSSProperties;
  const iter = playOnce ? '1' : 'infinite';
  const fill = playOnce ? 'forwards' : 'none';

  return (
    <div className="wv-loader" style={{ ...styleVars, background: bg }}>
      <div className="wv-mark-wrap">
        <svg
          className="wv-svg"
          viewBox="0 0 811 490"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Won Vision"
        >
          <g className="wv-content">
            <g transform="translate(0,490) scale(0.1, -0.1)">
              <path
                className="wv-path"
                d="M22 4843 c12 -32 421 -1133 909 -2448 l887 -2390 613 0 612 0 146 392 c87 236 148 387 153 379 6 -10 237 -629 280 -748 l10 -28 610 0 609 0 -7 23 c-11 35 -893 2409 -896 2412 -2 1 -277 4 -612 6 l-609 4 -145 -392 c-80 -216 -148 -393 -151 -393 -3 0 -276 728 -606 1618 l-600 1617 -613 3 -612 2 22 -57z"
                fill="black"
                stroke="black"
                strokeWidth={40}
                strokeLinecap="butt"
                strokeLinejoin="miter"
                strokeMiterlimit={4}
                pathLength={1}
              />
              <path
                className="wv-path"
                d="M3462 4888 c3 -7 412 -1110 909 -2450 l904 -2438 611 0 612 0 36 98 c19 53 224 604 454 1225 l419 1127 -611 0 -611 0 -145 -391 c-79 -215 -147 -392 -151 -395 -4 -2 -11 8 -17 24 -12 32 -1178 3169 -1187 3195 -7 16 -45 17 -617 17 -484 0 -609 -3 -606 -12z"
                fill="black"
                stroke="black"
                strokeWidth={40}
                strokeLinecap="butt"
                strokeLinejoin="miter"
                strokeMiterlimit={4}
                pathLength={1}
              />
              <path
                className="wv-dot"
                d="M7266 4884 c-291 -65 -500 -286 -546 -577 -53 -327 150 -661 465 -765 278 -93 595 1 769 227 178 232 200 541 54 789 -50 85 -179 210 -263 254 -152 79 -330 106 -479 72z"
                fill="black"
              />
            </g>
          </g>
        </svg>
      </div>

      <style jsx>{`
        .wv-loader {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: wv-loader-out var(--wv-duration) linear ${iter} ${fill};
        }

        .wv-mark-wrap {
          width: clamp(180px, 22vw, 320px);
          aspect-ratio: 811 / 490;
          /* leave breathing room for the dot's overshoot scale */
          padding: 6%;
          box-sizing: content-box;
        }

        .wv-svg {
          width: 100%;
          height: 100%;
          display: block;
          overflow: visible; /* don't clip the dot when it overshoots */
        }

        .wv-path {
          fill-opacity: 0;
          stroke-opacity: 1;
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation: wv-path var(--wv-duration) linear ${iter} ${fill};
        }
        @keyframes wv-path {
          0% {
            stroke-dashoffset: 1;
            fill-opacity: 0;
          }
          45% {
            stroke-dashoffset: 0;
            fill-opacity: 0;
          }
          65% {
            stroke-dashoffset: 0;
            fill-opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            fill-opacity: 1;
          }
        }

        .wv-dot {
          transform-box: fill-box;
          transform-origin: center;
          transform: scale(0);
          animation: wv-dot var(--wv-duration) cubic-bezier(0.4, 0, 0.2, 1) ${iter} ${fill};
        }
        @keyframes wv-dot {
          0%, 60% { transform: scale(0); }
          70%     { transform: scale(1.18); }
          73%     { transform: scale(1); }
          100%    { transform: scale(1); }
        }

        .wv-content {
          animation: wv-content var(--wv-duration) linear ${iter} ${fill};
        }
        @keyframes wv-content {
          0%, 92% { opacity: 1; }
          100%    { opacity: 0; }
        }

        @keyframes wv-loader-out {
          0%, 92% { opacity: 1; pointer-events: auto; }
          100%    { opacity: 0; pointer-events: none; visibility: hidden; }
        }

        @media (prefers-reduced-motion: reduce) {
          .wv-path,
          .wv-dot,
          .wv-content,
          .wv-loader {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
          .wv-path { fill-opacity: 1; stroke-opacity: 0; stroke-dashoffset: 0; }
          .wv-dot { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
