'use client';

import { useState } from 'react';

type Service = {
  num: string;
  name: string;
  meta: string;
  href: string;
  img: string;
  caption: string;
};

const services: Service[] = [
  {
    num: '01',
    name: 'Photography',
    meta: 'Stills · Twilight',
    href: '/book',
    img: 'https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?w=1800&q=85',
    caption: 'Photography · Carlton North',
  },
  {
    num: '02',
    name: 'Video',
    meta: 'Walkthrough · Lifestyle',
    href: '/book',
    img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1800&q=85',
    caption: 'Video · Fitzroy',
  },
  {
    num: '03',
    name: 'Drone',
    meta: 'CASA-licensed',
    href: '/book',
    img: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1800&q=85',
    caption: 'Drone · Brunswick',
  },
  {
    num: '04',
    name: 'Floor plans',
    meta: '2D · 3D',
    href: '/book',
    img: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1800&q=85',
    caption: 'Floor plans · Northcote',
  },
  {
    num: '05',
    name: 'Virtual staging',
    meta: 'Architectural',
    href: '/book',
    img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1800&q=85',
    caption: 'Virtual staging',
  },
];

export default function ServicesEditorial() {
  const [active, setActive] = useState(0);

  return (
    <section id="services" className="services-editorial" aria-label="Services">
      <div className="se__list">
        <span className="se__eyebrow">Services</span>
        {services.map((s, i) => (
          <a
            key={s.num}
            href={s.href}
            className="se__row"
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            aria-label={`Book ${s.name}`}
          >
            <span className="se__num">{s.num}</span>
            <span className="se__name">{s.name}</span>
            <span className="se__meta">{s.meta}</span>
          </a>
        ))}
      </div>
      <div className="se__pane" aria-hidden="true">
        {services.map((s, i) => (
          <figure
            key={s.num}
            className={'se__fig' + (i === active ? ' is-active' : '')}
          >
            <img src={s.img} alt="" />
            <figcaption>{s.caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
