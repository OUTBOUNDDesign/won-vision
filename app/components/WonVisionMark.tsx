type Props = { className?: string; 'aria-label'?: string };

export function WonVisionMark({ className, 'aria-label': label = 'Won Vision' }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 811 490"
      fill="currentColor"
      className={className}
      role="img"
      aria-label={label}
    >
      <g transform="translate(0,490) scale(0.1, -0.1)">
        <path className="wv-mark__path" pathLength={1} d="M22 4843 c12 -32 421 -1133 909 -2448 l887 -2390 613 0 612 0 146 392 c87 236 148 387 153 379 6 -10 237 -629 280 -748 l10 -28 610 0 609 0 -7 23 c-11 35 -893 2409 -896 2412 -2 1 -277 4 -612 6 l-609 4 -145 -392 c-80 -216 -148 -393 -151 -393 -3 0 -276 728 -606 1618 l-600 1617 -613 3 -612 2 22 -57z" />
        <path className="wv-mark__path" pathLength={1} d="M3462 4888 c3 -7 412 -1110 909 -2450 l904 -2438 611 0 612 0 36 98 c19 53 224 604 454 1225 l419 1127 -611 0 -611 0 -145 -391 c-79 -215 -147 -392 -151 -395 -4 -2 -11 8 -17 24 -12 32 -1178 3169 -1187 3195 -7 16 -45 17 -617 17 -484 0 -609 -3 -606 -12z" />
        <path className="wv-mark__dot" d="M7266 4884 c-291 -65 -500 -286 -546 -577 -53 -327 150 -661 465 -765 278 -93 595 1 769 227 178 232 200 541 54 789 -50 85 -179 210 -263 254 -152 79 -330 106 -479 72z" />
      </g>
    </svg>
  );
}
