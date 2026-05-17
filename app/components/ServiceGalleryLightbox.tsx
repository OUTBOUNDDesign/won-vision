'use client';

import { useEffect, useState } from 'react';

type Photo = { src: string; caption?: string };

const galleries: Record<string, Photo[]> = {
  photography: [
    { src: 'https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?w=1800&q=85', caption: 'Carlton North · Living' },
    { src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1800&q=85', caption: 'Fitzroy · Kitchen' },
    { src: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1800&q=85', caption: 'Northcote · Bedroom' },
    { src: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1800&q=85', caption: 'Hawthorn · Twilight' },
    { src: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1800&q=85', caption: 'Brunswick · Detail' },
    { src: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1800&q=85', caption: 'Carlton · Frontage' },
  ],
  video: [
    { src: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1800&q=85', caption: 'Walkthrough · Brunswick' },
    { src: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1800&q=85', caption: 'Reel · Hawthorn' },
    { src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1800&q=85', caption: 'Lifestyle · Fitzroy' },
    { src: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1800&q=85', caption: 'Frame · Northcote' },
  ],
  drone: [
    { src: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1800&q=85', caption: 'Aerial · Brunswick' },
    { src: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=1800&q=85', caption: 'Aerial · Yarra Valley' },
    { src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1800&q=85', caption: 'Aerial · Mornington' },
  ],
  floorplans: [
    { src: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1800&q=85', caption: '2D plan · Carlton' },
    { src: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1800&q=85', caption: '3D plan · Fitzroy' },
  ],
  staging: [
    { src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1800&q=85', caption: 'Living · Restaged' },
    { src: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1800&q=85', caption: 'Bedroom · Restaged' },
    { src: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1800&q=85', caption: 'Dining · Restaged' },
  ],
};

const titles: Record<string, string> = {
  photography: 'Photography',
  video: 'Video',
  drone: 'Drone',
  floorplans: 'Floor plans',
  staging: 'Virtual staging',
};

const ICON_SVG =
  '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true">' +
  '<rect x="3" y="5" width="18" height="14"/>' +
  '<path d="M3 16l5-5 4 4 3-3 6 6"/>' +
  '<circle cx="8" cy="9" r="1.4"/>' +
  '</svg>' +
  '<span>Examples</span>';

export default function ServiceGalleryLightbox() {
  const [active, setActive] = useState<string | null>(null);

  // Inject a "View gallery" button into every .svc-card on mount, keyed by
  // either the card's own data-gallery override or its parent .cat's
  // data-gallery. Uses a MutationObserver so cards added later (e.g. by the
  // booking flow's dynamic re-renders) still get a button.
  useEffect(() => {
    const inject = (root: ParentNode = document) => {
      const cards = root.querySelectorAll<HTMLElement>(
        '.svc-card, .pkg-card',
      );
      cards.forEach((card) => {
        const media = card.querySelector(
          '.svc-card__media, .pkg-card__media',
        );
        if (!media || media.querySelector('[data-gallery-btn]')) return;
        const cardOverride = card.dataset.gallery;
        const cat = card.closest('.cat') as HTMLElement | null;
        const catKey = cat?.dataset.gallery;
        const key = cardOverride || catKey || 'photography';
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'svc-card__gallery-btn';
        btn.setAttribute('data-gallery-btn', key);
        btn.setAttribute('aria-label', `${titles[key] ?? key} examples`);
        btn.innerHTML = ICON_SVG;
        media.appendChild(btn);
      });
    };

    inject();

    const mo = new MutationObserver(() => inject());
    mo.observe(document.body, { childList: true, subtree: true });

    return () => mo.disconnect();
  }, []);

  // Click delegate (capturing) — intercept gallery-btn clicks before the
  // svc-card add-to-cart handler runs; open the lightbox instead.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement | null)?.closest(
        '[data-gallery-btn]',
      ) as HTMLElement | null;
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      const key = btn.dataset.galleryBtn;
      if (key && galleries[key]) setActive(key);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActive(null);
    };
    document.addEventListener('click', handler, true);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('click', handler, true);
      document.removeEventListener('keydown', esc);
    };
  }, []);

  // Lock body scroll while the lightbox is open
  useEffect(() => {
    if (active) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [active]);

  if (!active) return null;

  const photos = galleries[active] ?? [];

  return (
    <div
      className="svc-lb"
      role="dialog"
      aria-modal="true"
      aria-label={`${titles[active] ?? active} gallery`}
      onClick={() => setActive(null)}
    >
      <div className="svc-lb__bar">
        <span className="svc-lb__title">{titles[active] ?? active} — gallery</span>
        <button
          className="svc-lb__close"
          type="button"
          aria-label="Close gallery"
          onClick={(e) => {
            e.stopPropagation();
            setActive(null);
          }}
        >
          ×
        </button>
      </div>
      <div className="svc-lb__grid" onClick={(e) => e.stopPropagation()}>
        {photos.map((p, i) => (
          <figure key={i} className="svc-lb__fig">
            <img src={p.src} alt={p.caption ?? ''} loading="lazy" />
            {p.caption && <figcaption>{p.caption}</figcaption>}
          </figure>
        ))}
      </div>
    </div>
  );
}
