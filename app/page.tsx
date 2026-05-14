import type { Metadata } from 'next';
import Script from 'next/script';
import { Wordmark } from './components/Wordmark';
import LoaderGate from './components/LoaderGate';
import ServicesEditorial from './components/ServicesEditorial';
import ProcessStepper from './components/ProcessStepper';

export const metadata: Metadata = {
  title: {
    absolute: 'Won Vision — Same day turn around.',
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
  .home-pkgs{padding:64px var(--gutter) 16px;background:var(--paper)}
  .home-pkgs__inner{max-width:var(--max);margin:0 auto}
  .home-pkgs__head{
    display:flex;justify-content:space-between;align-items:end;gap:24px;flex-wrap:wrap;
    margin-bottom:32px;
  }
  .home-pkgs__head h2{font-family:var(--display);font-weight:500;font-size:clamp(36px,4.4vw,60px);line-height:1.02;color:var(--ink);letter-spacing:-0.005em;margin-top:10px}
  .home-pkgs__head h2 em{font-style:italic;color:var(--steel);font-weight:400}
  .home-pkgs__head p{color:var(--graphite,#4A4A48);font-size:14px;line-height:1.6;max-width:380px}
  .home-pkgs__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;align-items:center}
  .home-pkg{
    display:flex;flex-direction:column;
    background:var(--paper);
    border:1px solid rgba(0,0,0,0.16);
    overflow:hidden;text-decoration:none;color:inherit;
    transition:transform .35s var(--ease,cubic-bezier(.2,.7,.2,1)), border-color .25s ease;
  }
  .home-pkg:hover{transform:translateY(-3px);border-color:var(--ink)}
  .home-pkg__media{aspect-ratio:1/1;background:#f3f3ef;position:relative;overflow:hidden}
  .home-pkg--featured .home-pkg__media{aspect-ratio:4/5}
  .home-pkg__media__img{position:absolute;inset:0;background-size:cover;background-position:center;filter:saturate(0.94);transition:filter .35s ease, transform .8s var(--ease,cubic-bezier(.2,.7,.2,1))}
  .home-pkg:hover .home-pkg__media__img{filter:saturate(1.05);transform:scale(1.03)}
  .home-pkg__tag{
    position:absolute;top:12px;left:12px;z-index:2;
    background:var(--ink);color:var(--paper);
    padding:6px 10px;
    font-family:var(--body);font-size:9px;letter-spacing:0.32em;text-transform:uppercase;font-weight:600;
  }
  .home-pkg__body{padding:18px 20px 20px;display:flex;flex-direction:column;gap:10px;flex:1}
  .home-pkg--featured .home-pkg__body{padding:22px 24px 24px;gap:12px}
  .home-pkg__name{font-family:var(--display);font-weight:500;font-size:22px;line-height:1.05;color:var(--ink);letter-spacing:-0.008em}
  .home-pkg--featured .home-pkg__name{font-size:28px}
  .home-pkg__desc{font-family:var(--body);font-size:12px;line-height:1.55;color:var(--graphite,#4A4A48)}
  .home-pkg__incl{font-family:var(--body);font-size:11.5px;line-height:1.55;color:var(--ink);margin:0;padding:0;list-style:none;flex:1}
  .home-pkg__incl li{padding:6px 0;border-top:1px solid rgba(0,0,0,0.08);display:flex;gap:8px;align-items:flex-start}
  .home-pkg__incl li:first-child{border-top:none}
  .home-pkg__incl li::before{content:'';flex:0 0 5px;width:5px;height:5px;background:var(--ink);margin-top:7px}
  .home-pkg__foot{
    display:flex;justify-content:space-between;align-items:baseline;gap:8px;
    margin-top:4px;padding-top:12px;border-top:1px solid rgba(0,0,0,0.12);
  }
  .home-pkg__price{font-family:var(--display);font-weight:500;font-size:24px;color:var(--ink);letter-spacing:-0.01em;line-height:1}
  .home-pkg--featured .home-pkg__price{font-size:30px}
  .home-pkg__price small{font-family:var(--body);font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:var(--graphite,#4A4A48);font-weight:500;display:block;margin-bottom:3px}
  .home-pkg__cta{font-family:var(--body);font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:var(--ink);font-weight:500;white-space:nowrap}
  @media (max-width:1100px){
    .home-pkgs__grid{grid-template-columns:repeat(2,1fr);align-items:stretch}
    .home-pkg--featured .home-pkg__media{aspect-ratio:1/1}
  }
  @media (max-width:760px){
    .home-pkgs{padding:48px var(--gutter) 12px}
    .home-pkgs__head{flex-direction:column;align-items:flex-start;gap:10px;margin-bottom:24px}
    .home-pkgs__grid{grid-template-columns:1fr;gap:12px}
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

        <div className="hero__layer">
          <div className="hero__copy fonts-ready">
            <h1 className="hero__hed hero__hed--wordmark">
              Won <span className="accent">Vision</span>
            </h1>
            <p className="hero__slogan">Same day turn around.</p>
          </div>
        </div>

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
                <ul className="home-pkg__incl">
                  <li>15 / 20 / 25 HDR photos by tier</li>
                  <li>2D floor plan with dimensions</li>
                  <li>Drone set — 5 edited images</li>
                  <li>Next-business-day delivery</li>
                </ul>
                <div className="home-pkg__foot">
                  <span className="home-pkg__price"><small>From</small>$280</span>
                  <span className="home-pkg__cta">Pick size →</span>
                </div>
              </div>
            </a>

            <a className="home-pkg home-pkg--featured" href="/book?package=signature#cat-packages">
              <div className="home-pkg__media">
                <span className="home-pkg__tag">Complete deliverable</span>
                <div className="home-pkg__media__img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=85')" }}></div>
              </div>
              <div className="home-pkg__body">
                <h3 className="home-pkg__name">Signature</h3>
                <p className="home-pkg__desc">Photo + plan + drone + a full listing video — the complete agent deliverable.</p>
                <ul className="home-pkg__incl">
                  <li>15 / 20 / 25 HDR photos by tier</li>
                  <li>2D floor plan + 5-image drone set</li>
                  <li>Listing video 16:9 · 40 / 50 / 60s</li>
                  <li>2-business-day video delivery</li>
                </ul>
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
                <ul className="home-pkg__incl">
                  <li>15 / 20 / 25 HDR photos by tier</li>
                  <li>2D floor plan + 5-image drone set</li>
                  <li>90s premium cinematic, full grade</li>
                  <li>5 twilight images · priority editing</li>
                </ul>
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
            <p>Anything not covered, email <a href="mailto:hello@wonvision.com.au">hello@wonvision.com.au</a> or <a href="/book">book a shoot</a> — the form walks you through the rest.</p>
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

      <footer id="contact" className="foot">
        <div className="foot__inner">
          <div className="foot__top reveal-stagger">
            <div>
              <a href="#top" data-home aria-label="Won Vision — home"><Wordmark /></a>
              <p>A Melbourne property media studio. Photography, video, drone, floor plans, virtual staging. Same day turn around.</p>
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
                <li><a href="mailto:hello@wonvision.com.au">hello@wonvision.com.au</a></li>
                <li><a href="tel:+61000000000">+61 (0) 0000 0000</a></li>
                <li><a href="https://www.instagram.com/won.vision/" target="_blank" rel="noopener">Instagram</a></li>
              </ul>
            </div>
            <div>
              <h4>Operations</h4>
              <ul>
                <li>Won Vision Pty Ltd</li>                <li>CASA-licensed drone ops</li>              </ul>
            </div>
          </div>
          <div className="foot__rule"></div>
          <div className="foot__bot">
            <span>© 2026 Won Vision Pty Ltd</span>
            <span>Same day turn around.</span>
            <span>Melbourne · Made in-house</span>
          </div>
        </div>
      </footer>

    </>
  );
}
