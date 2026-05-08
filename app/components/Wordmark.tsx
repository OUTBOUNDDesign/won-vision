import { WonVisionMark } from './WonVisionMark';

type Props = {
  className?: string;
  href?: string;
  ariaLabel?: string;
  markOnly?: boolean;
};

export function Wordmark({
  className = 'wordmark',
  ariaLabel = 'Won Vision — home',
  markOnly = false,
}: Props) {
  return (
    <span className={className} aria-label={ariaLabel}>
      <WonVisionMark className="wordmark__mark" aria-label="Won Vision" />
      {!markOnly && <span className="wordmark__text">WON VISION</span>}
    </span>
  );
}
