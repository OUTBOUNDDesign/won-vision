import type { Metadata } from 'next';
import Script from 'next/script';
import { Wordmark } from './components/Wordmark';
import LoaderGate from './components/LoaderGate';
import ServicesEditorial from './components/ServicesEditorial';
import ProcessStepper from './components/ProcessStepper';

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

      <style>{`
  /* ---------- Home: Packages quick-press ---------- */
  .home-pkgs{padding:96px var(--gutter) 24px;background:var(--paper)}
  .home-pkgs__inner{max-width:var(--max);margin:0 auto}
  .home-pkgs__head{
    display:flex;justify-content:space-between;align-items:end;gap:24px;flex-wrap:wrap;
    margin-bottom:48px;
  }
  .home-pkgs__head h2{font-family:var(--display);font-weight:500;font-size:clamp(40px,5vw,72px);line-height:1.02;color:var(--ink);letter-spacing:-0.005em;margin-top:14px}
  .home-pkgs__head h2 em{font-style:italic;color:var(--steel);font-weight:400}
  .home-pkgs__head p{color:var(--graphite,#4A4A48);font-size:15px;line-height:1.6;max-width:420px}
  .home-pkgs__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
  .home-pkg{
    display:flex;flex-direction:column;
    background:var(--paper);
    border:1px solid rgba(0,0,0,0.16);
    overflow:hidden;text-decoration:none;color:inherit;
    transition:transform .35s var(--ease,cubic-bezier(.2,.7,.2,1)), border-color .25s ease;
  }
  .home-pkg:hover{transform:translateY(-3px);border-color:var(--ink)}
  .home-pkg__media{aspect-ratio:5/3;background:#f3f3ef;position:relative;overflow:hidden}
  .home-pkg__media__img{position:absolute;inset:0;background-size:cover;background-position:center;filter:saturate(0.94);transition:filter .35s ease}
  .home-pkg:hover .home-pkg__media__img{filter:saturate(1.05)}
  .home-pkg__tag{
    position:absolute;top:12px;left:12px;z-index:2;
    background:var(--ink);color:var(--paper);
    padding:6px 10px;
    font-family:var(--body);font-size:9px;letter-spacing:0.32em;text-transform:uppercase;font-weight:600;
  }
  .home-pkg__body{padding:20px 22px 22px;display:flex;flex-direction:column;gap:10px;flex:1}
  .home-pkg__name{font-family:var(--display);font-weight:500;font-size:24px;line-height:1.1;color:var(--ink);letter-spacing:-0.005em}
  .home-pkg__desc{font-family:var(--body);font-size:12px;line-height:1.55;color:var(--graphite,#4A4A48);flex:1}
  .home-pkg__foot{
    display:flex;justify-content:space-between;align-items:baseline;gap:8px;
    margin-top:8px;padding-top:14px;border-top:1px solid rgba(0,0,0,0.12);
  }
  .home-pkg__price{font-family:var(--display);font-weight:500;font-size:24px;color:var(--ink);letter-spacing:-0.01em;line-height:1}
  .home-pkg__price small{font-family:var(--body);font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:var(--graphite,#4A4A48);font-weight:500;margin-right:4px}
  .home-pkg__cta{font-family:var(--body);font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:var(--ink);font-weight:500}
  @media (max-width:1100px){.home-pkgs__grid{grid-template-columns:repeat(2,1fr)}}
  @media (max-width:760px){
    .home-pkgs{padding:64px var(--gutter) 16px}
    .home-pkgs__head{flex-direction:column;align-items:flex-start;gap:10px;margin-bottom:28px}
    .home-pkgs__grid{grid-template-columns:1fr;gap:14px}
  }

  /* ---------- Home: FAQ ---------- */
  .home-faq{padding:96px var(--gutter) 120px;background:var(--paper);border-top:1px solid rgba(0,0,0,0.08)}
  .home-faq__inner{max-width:var(--max);margin:0 auto;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.4fr);gap:64px;align-items:start}
  .home-faq__head h2{font-family:var(--display);font-weight:500;font-size:clamp(36px,4.6vw,64px);line-height:1.02;color:var(--ink);letter-spacing:-0.005em;margin-top:14px}
  .home-faq__head h2 em{font-style:italic;color:var(--steel);font-weight:400}
  .home-faq__head p{color:var(--graphite,#4A4A48);font-size:14px;line-height:1.6;margin-top:18px;max-width:340px}
  .home-faq__head a{color:var(--ink);text-decoration:underline;text-underline-offset:3px}
  .home-faq__list{display:flex;flex-direction:column;border-top:1px solid rgba(0,0,0,0.16)}
  .home-faq__item{border-bottom:1px solid rgba(0,0,0,0.16)}
  .home-faq__item > summary{
    list-style:none;cursor:pointer;
    display:flex;justify-content:space-between;align-items:center;gap:24px;
    padding:22px 4px;
    font-family:var(--display);font-weight:500;font-size:18px;line-height:1.25;color:var(--ink);letter-spacing:-0.005em;
  }
  .home-faq__item > summary::-webkit-details-marker{display:none}
  .home-faq__item > summary::after{
    content:'+';font-family:var(--display);font-size:22px;color:var(--ink);font-weight:400;
    transition:transform .3s var(--ease,cubic-bezier(.2,.7,.2,1));
  }
  .home-faq__item[open] > summary::after{content:'–'}
  .home-faq__item > div{
    padding:0 4px 22px;
    font-family:var(--body);font-size:13px;line-height:1.65;color:var(--graphite,#4A4A48);
    max-width:680px;
  }
  .home-faq__item > div p + p{margin-top:10px}
  @media (max-width:900px){
    .home-faq__inner{grid-template-columns:1fr;gap:32px}
    .home-faq{padding:64px var(--gutter) 80px}
  }
`}</style>

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

      {/* SERVICES + PROCESS — wrapper lets us flip the order on mobile so
          the four-step explainer sits above the services list on phones */}
      <div className="services-process-block">
        <ServicesEditorial />
        <ProcessStepper />
      </div>

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

      {/* PACKAGES quick-press */}
      <section id="packages" className="home-pkgs">
        <div className="home-pkgs__inner">
          <div className="home-pkgs__head reveal-stagger">
            <div>
              <span className="eyebrow">Packages</span>
              <h2>Bundled,<br /><em>and ready to book.</em></h2>
            </div>
            <p>Three flagship bundles cover most listings — Showcase for the everyday sale, Signature when video matters, Cinematic for luxury. Pick one, choose your property size, we handle the rest. 20% launch promo applied at checkout.</p>
          </div>

          <div className="home-pkgs__grid reveal-stagger">
            <a className="home-pkg" href="/book?package=showcase#cat-packages">
              <div className="home-pkg__media">
                <span className="home-pkg__tag">Most booked</span>
                <div className="home-pkg__media__img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?w=1200&q=85')" }}></div>
              </div>
              <div className="home-pkg__body">
                <h3 className="home-pkg__name">Showcase</h3>
                <p className="home-pkg__desc">Photos, floor plan and a 5-image drone set — the standard suburban listing bundle.</p>
                <div className="home-pkg__foot">
                  <span className="home-pkg__price"><small>From</small>$280</span>
                  <span className="home-pkg__cta">Pick size →</span>
                </div>
              </div>
            </a>

            <a className="home-pkg" href="/book?package=signature#cat-packages">
              <div className="home-pkg__media">
                <span className="home-pkg__tag">Complete deliverable</span>
                <div className="home-pkg__media__img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=85')" }}></div>
              </div>
              <div className="home-pkg__body">
                <h3 className="home-pkg__name">Signature</h3>
                <p className="home-pkg__desc">Photo + plan + drone + a full listing video — the complete agent deliverable.</p>
                <div className="home-pkg__foot">
                  <span className="home-pkg__price"><small>From</small>$540</span>
                  <span className="home-pkg__cta">Pick size →</span>
                </div>
              </div>
            </a>

            <a className="home-pkg" href="/book?package=cinematic#cat-packages">
              <div className="home-pkg__media">
                <span className="home-pkg__tag">Flagship</span>
                <div className="home-pkg__media__img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=85')" }}></div>
              </div>
              <div className="home-pkg__body">
                <h3 className="home-pkg__name">Cinematic</h3>
                <p className="home-pkg__desc">Twilight imagery and a 90-second cinematic — luxury listing presentation.</p>
                <div className="home-pkg__foot">
                  <span className="home-pkg__price"><small>From</small>$880</span>
                  <span className="home-pkg__cta">Pick size →</span>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="home-faq">
        <div className="home-faq__inner">
          <div className="home-faq__head reveal">
            <span className="eyebrow">FAQ</span>
            <h2>The <em>quick</em> answers.</h2>
            <p>Anything not covered, email <a href="mailto:studio@wonvision.com.au">studio@wonvision.com.au</a> or <a href="/book">book a shoot</a> — the form walks you through the rest.</p>
          </div>

          <div className="home-faq__list reveal-stagger">
            <details className="home-faq__item">
              <summary>What areas do you service?</summary>
              <div>
                <p>Won Vision operates within a 100 km radius of the Melbourne CBD as standard — Greater Melbourne, the Mornington and Bellarine peninsulas, the Yarra Valley and the Macedon Ranges.</p>
                <p>Properties beyond 20 km from the CBD attract a distance surcharge of $20 per 5 km block. Visits further afield across Victoria are available by appointment.</p>
              </div>
            </details>

            <details className="home-faq__item">
              <summary>How does the 20% launch promo work?</summary>
              <div>
                <p>The launch promo applies 20% off every service — rental, sales, packages, drone, video, floor plans and add-ons — automatically at checkout, until 31 December 2026. No code required.</p>
                <p>The promo stacks with our volume discounts on virtual staging.</p>
              </div>
            </details>

            <details className="home-faq__item">
              <summary>How fast is delivery?</summary>
              <div>
                <p>Standard delivery is next business day for photos and 2 business days for video. Floor plans deliver in 1–2 business days.</p>
                <p>Same-day rush is available on photos for +$100 (order before 11am).</p>
              </div>
            </details>

            <details className="home-faq__item">
              <summary>What's the difference between a package and à la carte?</summary>
              <div>
                <p>Packages (Showcase, Signature, Cinematic) bundle our most-requested services together at 18–29% savings compared to buying each piece individually. Photo count scales automatically with property size.</p>
                <p>À la carte lets you build a custom shoot — photography only, drone only, video only, or any combination. Both routes use the same booking form.</p>
              </div>
            </details>

            <details className="home-faq__item">
              <summary>Who owns the photos? What are the licensing terms?</summary>
              <div>
                <p>You receive an agent-facing licence to use the content for the listing period — agency website, realestate.com.au, Domain, agency socials, print collateral and email campaigns. Won Vision retains copyright and the right to use the imagery in our own portfolio.</p>
                <p>Extended licensing for developer marketing, hotel listings, or commercial use is available — ask at booking.</p>
              </div>
            </details>

            <details className="home-faq__item">
              <summary>What if the weather is bad on shoot day?</summary>
              <div>
                <p>We monitor the forecast 24 hours out. Indoor photography proceeds in any conditions. Drone, twilight and exterior-dependent work reschedules at no charge when weather makes a quality shoot impossible.</p>
                <p>Sky replacement is included in all sales photography, so an overcast day rarely affects deliverables.</p>
              </div>
            </details>

            <details className="home-faq__item">
              <summary>How does virtual staging and AI editing work?</summary>
              <div>
                <p>Virtual staging, decluttering, day-to-dusk conversions, sky replacement, grass enhancement and object removal are handled in-house using our AI editing pipeline — competitors outsource these at 2–3x our rates.</p>
                <p>Once the shoot is delivered, you review the gallery in the Won Vision client portal and pick which photos need editing. You pay only for what you choose.</p>
              </div>
            </details>

            <details className="home-faq__item">
              <summary>Can I add or remove things after booking?</summary>
              <div>
                <p>Yes — add-ons can be added any time before the shoot. Removing items inside 24 hours of the booked slot may incur a cancellation fee for crew already scheduled.</p>
              </div>
            </details>

            <details className="home-faq__item">
              <summary>Is the drone work licensed and insured?</summary>
              <div>
                <p>All aerial work is performed by CASA-licensed operators with PPIB / Coverdrone public liability insurance. We file flight notifications where required and operate within all CASA regulations.</p>
              </div>
            </details>

            <details className="home-faq__item">
              <summary>How do I pay?</summary>
              <div>
                <p>Payment is taken at checkout via Stripe (card, Apple Pay, Google Pay) or invoiced to the agency on 7-day terms once we've onboarded your agency. All prices are quoted ex-GST; tax invoices issued after delivery.</p>
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* Studio info / contact strip */}
      <section id="contact" style={{ padding: '64px var(--gutter)', background: 'var(--paper)', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
        <div style={{ maxWidth: 'var(--max)', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 28 }}>
          <div>
            <span className="eyebrow">Contact</span>
            <h3 style={{ fontFamily: 'var(--display)', fontWeight: 500, fontSize: 28, marginTop: 12, letterSpacing: '-0.005em' }}>Studio</h3>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--graphite, #4A4A48)', marginTop: 8, maxWidth: 280 }}>Greater Melbourne and beyond by appointment.</p>
          </div>
          <div><b style={{ fontFamily: 'var(--body)', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--graphite, #4A4A48)', display: 'block', marginBottom: 6 }}>Email</b><a href="mailto:studio@wonvision.com.au">studio@wonvision.com.au</a></div>
          <div><b style={{ fontFamily: 'var(--body)', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--graphite, #4A4A48)', display: 'block', marginBottom: 6 }}>Phone</b><a href="tel:+61000000000">+61 (0) 0000 0000</a></div>
          <div><b style={{ fontFamily: 'var(--body)', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--graphite, #4A4A48)', display: 'block', marginBottom: 6 }}>Hours</b><span>Mon–Fri · 8am–6pm AEST</span></div>
          <div><b style={{ fontFamily: 'var(--body)', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--graphite, #4A4A48)', display: 'block', marginBottom: 6 }}>Booking</b><a href="/book">Book a shoot →</a></div>
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

    </>
  );
}
