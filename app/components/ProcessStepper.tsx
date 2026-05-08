'use client';

import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';

const steps = [
  {
    num: '01',
    name: 'Book',
    desc: 'Pick services and a date through the booking calendar. Studio confirms within one working day.',
  },
  {
    num: '02',
    name: 'Plan',
    desc: 'Site walk and shot list. Light timing locked, drone permissions filed before the shoot day.',
  },
  {
    num: '03',
    name: 'Capture',
    desc: 'A single visit covers stills, video, drone and floor plans. Naturally coloured, no over-direction.',
  },
  {
    num: '04',
    name: 'Deliver',
    desc: 'Edited files within 48 hours — high-res, web set, walkthrough cut, brand-aligned plans.',
  },
];

export default function ProcessStepper() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add('is-visible');
            io.disconnect();
          }
        });
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="process" className="process-stepper" ref={ref} aria-label="Process">
      <div className="ps__inner">
        <span className="ps__eyebrow">Process — how a shoot runs</span>
        <div className="ps__row">
          <span className="ps__rule" aria-hidden="true" />
          {steps.map((s, i) => (
            <div
              key={s.num}
              className="ps__step"
              style={{ '--i': i } as CSSProperties}
            >
              <span className="ps__dot" aria-hidden="true" />
              <span className="ps__num">{s.num} / {s.name}</span>
              <h3 className="ps__name">{s.name}</h3>
              <p className="ps__desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
