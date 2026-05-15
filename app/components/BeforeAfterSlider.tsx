'use client';

import { useCallback, useId, useRef, useState } from 'react';

type Props = {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt?: string;
  afterAlt?: string;
  label: string;
};

/**
 * Drag-to-reveal before/after image comparison slider.
 * Pointer + touch + keyboard accessible. No external deps.
 * Brand: pure B&W, sharp corners, Sora typography (inherits via globals).
 *
 * NOTE: images are placeholder Unsplash photos — swap via the props above
 * once final before/after assets are provided.
 */
export default function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeAlt = 'Before',
  afterAlt = 'After',
  label,
}: Props) {
  const [pos, setPos] = useState(50); // 0..100, percent from left
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const sliderId = useId();

  const updateFromClientX = useCallback((clientX: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, pct)));
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    updateFromClientX(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    updateFromClientX(e.clientX);
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 2;
    if (e.key === 'ArrowLeft') {
      setPos((p) => Math.max(0, p - step));
      e.preventDefault();
    } else if (e.key === 'ArrowRight') {
      setPos((p) => Math.min(100, p + step));
      e.preventDefault();
    } else if (e.key === 'Home') {
      setPos(0);
      e.preventDefault();
    } else if (e.key === 'End') {
      setPos(100);
      e.preventDefault();
    }
  };

  return (
    <figure className="ba-slider">
      <div
        ref={wrapRef}
        className="ba-slider__frame"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        aria-labelledby={`${sliderId}-label`}
      >
        {/* AFTER (full underneath) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={afterSrc}
          alt={afterAlt}
          className="ba-slider__img ba-slider__img--after"
          draggable={false}
        />
        {/* BEFORE (clipped to the left of the divider) */}
        <div
          className="ba-slider__before-clip"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={beforeSrc}
            alt={beforeAlt}
            className="ba-slider__img"
            draggable={false}
          />
        </div>

        {/* Corner tags */}
        <span className="ba-slider__tag ba-slider__tag--before">Before</span>
        <span className="ba-slider__tag ba-slider__tag--after">After</span>

        {/* Divider + handle */}
        <div
          role="slider"
          tabIndex={0}
          aria-label={`${label} before/after comparison`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          onKeyDown={onKeyDown}
          className="ba-slider__divider"
          style={{ left: `${pos}%` }}
        >
          <span className="ba-slider__handle" aria-hidden="true">
            <span className="ba-slider__handle-arrow ba-slider__handle-arrow--l">‹</span>
            <span className="ba-slider__handle-arrow ba-slider__handle-arrow--r">›</span>
          </span>
        </div>
      </div>
      <figcaption id={`${sliderId}-label`} className="ba-slider__label">
        {label}
      </figcaption>
    </figure>
  );
}
