import type { Metadata } from 'next';
import Script from 'next/script';
import { Wordmark } from './components/Wordmark';
import LoaderGate from './components/LoaderGate';
import ServicesEditorial from './components/ServicesEditorial';

export const metadata: Metadata = {
  title: {
    absolute: 'Won Vision — Your listing the star, we make it go far.',
  },
  description:
    'Melbourne real estate photography by Won Vision — a property media studio offering listing photography, video, CASA-licensed drone, floor plans, virtual staging, agent headshots and day-to-dusk conversions. Flexible packages and add-ons built to sell premium property faster.',
  alternates: {
    canonical: 'https://wonvision.com.au/',
  },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    url: 'https://wonvision.com.au/',
    title: 'Won Vision — Melbourne Real Estate Photography Studio',
    description:
      'Melbourne real estate photography studio. Photography, video, CASA-licensed drone, floor plans, virtual staging, headshots and day-to-dusk. Built to sell premium property faster.',
  },
  twitter: { card: 'summary_large_image' },
};

export default function HomePage() {
  return (
    <>
      <LoaderGate />

      {/* Leaflet stylesheet for the contact map */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />

      {/* OUTBOUND Pixel — analytics for the Won Vision tenant in OUTBOUND Operations */}
      <Script
        src="https://ops.outbounddesign.com.au/track.js"
        strategy="afterInteractive"
        data-outbound-slug="won-vision"
      />

      <header className="nav" data-start-light="true">
        <div className="nav__brand">
          <a href="#top" aria-label="Won Vision — home" data-home>
            <Wordmark />
          </a>
        </div>
        <nav className="nav__links">
          <a href="#services">Services</a>
          <a href="#contact">Contact</a>
          <a href="/gallery">Gallery</a>
        </nav>
        <div className="nav__right">
          <a href="/book" className="nav__cta">Book now</a>
        </div>
        <button className="nav__burger" aria-label="Menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
      </header>
      <aside className="nav__drawer" aria-hidden="true">
        <ul>
          <li><a href="#services">Services</a></li>
          <li><a href="#contact">Contact</a></li>
          <li><a href="/gallery"><em>Gallery</em></a></li>
          <li><a href="/book" className="drawer-cta">Book now →</a></li>
        </ul>
        <div className="nav__drawer__foot">
          <span>Won Vision</span><span>Melbourne · 2026</span>
        </div>
      </aside>

      {/* HERO — aperture cursor lens */}
      <section className="hero">
        <div className="hero__base"></div>
        <div className="hero__lens"></div>
        <div className="hero__veil"></div>

        <div className="hero__cursor"></div>
      </section>

      {/* SERVICES — editorial index with sticky hover image (V2) */}
      <ServicesEditorial />

      {/* SELECTED WORK */}
      <section id="work" className="section work">
        <div className="section__inner">
          <div className="section__head section__head--split reveal-stagger">
            <div>
              <span className="eyebrow">Selected work</span>
              <h2 className="h2" style={{ marginTop: 18 }}>Recent listings,<br /><em>edited.</em></h2>
            </div>
          </div>

          <div className="work__grid reveal-stagger">
            <a className="work__item a" href="/gallery">
              <img src="https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?w=1600&q=85" alt="Carlton North living" />
              <div className="work__item__caption"><span><b>Carlton North</b><br />12 Drummond Street</span><span>Photography · Video</span></div>
            </a>
            <a className="work__item b" href="/gallery">
              <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=85" alt="Fitzroy interior" />
              <div className="work__item__caption"><span><b>Fitzroy</b><br />4 Argyle Place</span><span>Photography</span></div>
            </a>
            <a className="work__item c" href="/gallery">
              <img src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=85" alt="Brunswick exterior" />
              <div className="work__item__caption"><span><b>Brunswick</b><br />118 Lygon Street</span><span>Drone · Video</span></div>
            </a>
            <a className="work__item d" href="/gallery">
              <img src="https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=85" alt="Northcote bedroom" />
              <div className="work__item__caption"><span><b>Northcote</b><br />21 Westbourne Grove</span><span>Photography</span></div>
            </a>
          </div>

          <div className="work__cta reveal" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href="/gallery" className="nav__cta nav__cta--ghost" style={{ padding: '16px 32px', fontSize: 12 }}>View the full gallery →</a>
            <a href="/book" className="nav__cta" style={{ padding: '16px 32px', fontSize: 12 }}>Book now</a>
          </div>
        </div>
      </section>

      {/* PROCESS — accordion editorial with counting numbers */}
      <section id="process" className="process">
        <div className="process__inner">
          <div className="process__head reveal-stagger">
            <h2 className="h2">Process<em>.</em></h2>
          </div>

          <div className="process__list" id="processList">

            <article className="process__item is-open">
              <button className="process__row" type="button" aria-expanded="true">
                <span className="process__num" data-count="1">0</span>
                <h3 className="process__name">Book</h3>
                <span className="process__plus" aria-hidden="true">+</span>
              </button>
              <div className="process__body">
                <div className="process__body__inner">
                  <div className="process__copy">
                    <p>Pick your services and a date through the booking calendar — photography, video, drone, floor plans or virtual staging. Studio confirms within one working day.</p>
                    <ul>
                      <li>Choose services &amp; date</li>
                      <li>Add the property details</li>
                      <li>Confirmation within 24 hours</li>
                    </ul>
                  </div>
                  <div className="process__media"><img src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1400&q=85" alt="" /></div>
                </div>
              </div>
            </article>

            <article className="process__item">
              <button className="process__row" type="button" aria-expanded="false">
                <span className="process__num" data-count="2">0</span>
                <h3 className="process__name">Plan</h3>
                <span className="process__plus" aria-hidden="true">+</span>
              </button>
              <div className="process__body">
                <div className="process__body__inner">
                  <div className="process__copy">
                    <p>Site walk and shot list. Light timing locked, drone permissions filed, virtual staging directions agreed before the shoot day.</p>
                    <ul>
                      <li>15-min site walk</li>
                      <li>Shot list shared</li>
                      <li>Drone permissions filed</li>
                    </ul>
                  </div>
                  <div className="process__media"><img src="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1400&q=85" alt="" /></div>
                </div>
              </div>
            </article>

            <article className="process__item">
              <button className="process__row" type="button" aria-expanded="false">
                <span className="process__num" data-count="3">0</span>
                <h3 className="process__name">Capture</h3>
                <span className="process__plus" aria-hidden="true">+</span>
              </button>
              <div className="process__body">
                <div className="process__body__inner">
                  <div className="process__copy">
                    <p>A single visit covers photography, video, drone and floor plans. Naturally coloured imagery, no preset, no over-direction.</p>
                    <ul>
                      <li>Stills · twilight</li>
                      <li>Video walkthrough</li>
                      <li>Drone aerials</li>
                    </ul>
                  </div>
                  <div className="process__media"><img src="https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?w=1400&q=85" alt="" /></div>
                </div>
              </div>
            </article>

            <article className="process__item">
              <button className="process__row" type="button" aria-expanded="false">
                <span className="process__num" data-count="4">0</span>
                <h3 className="process__name"><em>Deliver</em></h3>
                <span className="process__plus" aria-hidden="true">+</span>
              </button>
              <div className="process__body">
                <div className="process__body__inner">
                  <div className="process__copy">
                    <p>Edited files within 48 hours of the shoot — high-resolution stills, web-optimised set, cut walkthrough video, brand-aligned floor plans.</p>
                    <ul>
                      <li>High-res &amp; web sets</li>
                      <li>Cut walkthrough</li>
                      <li>Brand-aligned plans</li>
                    </ul>
                  </div>
                  <div className="process__media"><img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&q=85" alt="" /></div>
                </div>
              </div>
            </article>

          </div>
        </div>
      </section>

      {/* CONTACT B — Map + studio info */}
      <section id="contact" className="con-b">
        <div id="serviceMap" className="con-b__map" aria-label="Map of Melbourne with a 100 kilometre service radius">
          <div className="con-b__label">100 KM SERVICE RADIUS</div>
        </div>
        <div className="con-b__copy reveal">
          <span className="eyebrow">Find the studio</span>
          <h2>Greater Melbourne,<br /><em>and beyond.</em></h2>
          <p>Studio works within 100 km of the Melbourne CBD — Greater Melbourne, the Mornington and Bellarine peninsulas, the Yarra Valley and the Macedon Ranges. Visits by appointment elsewhere across Victoria.</p>
          <div className="con-b__list">
            <div className="item"><b>Email</b><a href="mailto:studio@wonvision.com.au">studio@wonvision.com.au</a></div>
            <div className="item"><b>Phone</b><a href="tel:+61000000000">+61 (0) 0000 0000</a></div>
            <div className="item"><b>Hours</b><span>Mon–Fri · 8am–6pm AEST</span></div>
            <div className="item"><b>Booking</b><a href="/book">Book a shoot →</a></div>
          </div>
        </div>
      </section>

      <footer className="foot">
        <div className="foot__inner">
          <div className="foot__top reveal-stagger">
            <div>
              <a href="#top" data-home aria-label="Won Vision — home"><Wordmark /></a>
              <p>A Melbourne property media studio. Photography, video, drone, floor plans, virtual staging. Your listing the star, we make it go far.</p>
            </div>
            <div>
              <h4>Studio</h4>
              <ul>
                <li><a href="#services">Services</a></li>
                <li><a href="/gallery">Gallery</a></li>
                <li><a href="/book">Book now</a></li>
              </ul>
            </div>
            <div>
              <h4>Contact</h4>
              <ul>
                <li><a href="mailto:studio@wonvision.com.au">studio@wonvision.com.au</a></li>
                <li><a href="tel:+61000000000">+61 (0) 0000 0000</a></li>
                <li><a href="https://www.instagram.com/" target="_rel">Instagram</a></li>
              </ul>
            </div>
            <div>
              <h4>Operations</h4>
              <ul>
                <li>Won Vision Pty Ltd</li>
                <li>ABN — coming soon</li>
                <li>CASA-licensed drone ops</li>
                <li>PPIB / Coverdrone insured</li>
              </ul>
            </div>
          </div>
          <div className="foot__rule"></div>
          <div className="foot__bot">
            <span>© 2026 Won Vision Pty Ltd</span>
            <span>Your listing the star, we make it go far.</span>
            <span>Melbourne · Made in-house</span>
          </div>
        </div>
      </footer>

      {/* Leaflet for the service-area map */}
      <Script
        src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
        crossOrigin=""
        strategy="afterInteractive"
      />

      {/* Service-area map — Melbourne CBD + 100 km radius. Display-only. */}
      <Script id="wv-service-map" strategy="afterInteractive">
        {`(function(){
  function boot(){
    var el = document.getElementById('serviceMap');
    if(!el || typeof L === 'undefined') { setTimeout(boot, 80); return; }

    var MELBOURNE = [-37.8136, 144.9631];
    var map = null, radiusCircle = null;

    function init(){
      if (map) return;
      map = L.map(el, {
        center: MELBOURNE,
        zoom: 8,
        attributionControl: false,
        zoomControl: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        dragging: false,
        touchZoom: false,
        boxZoom: false,
        keyboard: false,
        tap: false,
        zoomSnap: 0.25
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19,
        crossOrigin: true
      }).addTo(map);

      radiusCircle = L.circle(MELBOURNE, {
        radius: 100000,
        color: '#4A6178',
        weight: 2.5,
        opacity: 1,
        fillColor: '#4A6178',
        fillOpacity: 0.10,
        interactive: false
      }).addTo(map);

      L.circleMarker(MELBOURNE, {
        radius: 8,
        color: '#FAFAF7',
        weight: 2,
        fillColor: '#4A6178',
        fillOpacity: 1,
        interactive: false
      }).addTo(map);

      var SUBURBS = [
        { name: 'Melbourne CBD', ll: [-37.8136, 144.9631], cbd: true },
        { name: 'Geelong',       ll: [-38.1499, 144.3617] },
        { name: 'Werribee',      ll: [-37.9000, 144.6627] },
        { name: 'Gisborne',      ll: [-37.4900, 144.5957] },
        { name: 'Wallan',        ll: [-37.4143, 144.9803] },
        { name: 'Healesville',   ll: [-37.6520, 145.5210] },
        { name: 'Dandenong',     ll: [-37.9818, 145.2147] },
        { name: 'Frankston',     ll: [-38.1413, 145.1198] }
      ];
      SUBURBS.forEach(function(s){
        L.marker(s.ll, {
          icon: L.divIcon({
            className: 'map-suburb' + (s.cbd ? ' map-suburb--cbd' : ''),
            html: '<div class="map-suburb__inner">'
                + '<div class="map-suburb__pip"></div>'
                + '<span class="map-suburb__name">' + s.name + '</span>'
                + '</div>',
            iconSize: [0, 0],
            iconAnchor: [0, 0]
          }),
          interactive: false,
          keyboard: false
        }).addTo(map);
      });

      fit();
      map.whenReady(function(){ setTimeout(fit, 80); });
      map.on('load', function(){ setTimeout(fit, 80); });

      var rt = null;
      window.addEventListener('resize', function(){
        clearTimeout(rt);
        rt = setTimeout(fit, 200);
      });
    }

    function fit(){
      if (!map || !radiusCircle) return;
      map.invalidateSize();
      map.fitBounds(radiusCircle.getBounds(), { padding: [40, 40] });
    }

    var started = false;
    var obs = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (!started && e.isIntersecting && e.intersectionRatio > 0){
          started = true;
          obs.disconnect();
          setTimeout(init, 80);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -8% 0px' });
    obs.observe(el);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();`}
      </Script>
    </>
  );
}
