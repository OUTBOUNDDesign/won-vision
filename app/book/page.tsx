import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { Wordmark } from '../components/Wordmark';
import ServiceGalleryLightbox from '../components/ServiceGalleryLightbox';

export const metadata: Metadata = {
  title: 'Book a shoot',
  description:
    'Book a Melbourne real estate shoot with Won Vision — photography, listing video, CASA-licensed drone, floor plans, virtual staging and headshots. Flexible packages and add-ons across Melbourne and Victoria.',
};

export default function BookPage() {
  return (
    <>
      <style>{`
  /* ---------- Service catalogue page ---------- */
  .svc-page{padding:48px var(--gutter) 160px;background:var(--paper)}
  .svc-page__intro{
    max-width:var(--max);margin:0 auto 48px;
    display:flex;justify-content:space-between;align-items:end;gap:32px;flex-wrap:wrap;
  }
  .svc-page__intro h2{font-family:var(--display);font-weight:500;font-size:clamp(40px,5vw,72px);line-height:1.02;color:var(--ink);letter-spacing:-0.005em;margin-top:14px}
  .svc-page__intro h2 em{font-style:italic;color:var(--steel);font-weight:400}
  .svc-page__intro p{color:var(--graphite);font-size:15px;line-height:1.6;max-width:380px}

  .cat{max-width:var(--max);margin:0 auto;padding-top:48px}
  .cat__head{
    display:flex;justify-content:space-between;align-items:end;gap:24px;
    border-bottom:1px solid rgba(74,74,72,0.18);padding-bottom:18px;margin-bottom:24px;
  }
  .cat__head h3{
    font-family:var(--display);font-weight:500;
    font-size:clamp(28px,3.4vw,44px);color:var(--ink);letter-spacing:-0.005em;line-height:1;
  }
  .cat__head h3 em{font-style:italic;color:var(--steel);font-weight:400}
  .cat__count{font-family:var(--body);font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:var(--steel);font-weight:500}

  .svc-grid{
    display:grid;grid-template-columns:repeat(3,1fr);gap:18px;
  }
  .svc-card{
    display:flex;flex-direction:column;
    background:var(--paper);
    border:1px solid rgba(74,74,72,0.16);
    overflow:hidden;
    cursor:pointer;
    transition:transform .35s var(--ease), border-color .25s ease, box-shadow .25s ease;
    position:relative;
  }
  .svc-card:hover{transform:translateY(-3px);border-color:var(--ink)}
  .svc-card.is-added{border-color:var(--steel);background:rgba(74,97,120,0.04)}

  .svc-card__media{
    aspect-ratio:5/3;overflow:hidden;background:var(--soft);
    position:relative;
  }
  .svc-card__media__img{
    position:absolute;inset:0;
    background-size:cover;background-position:center;
    filter:saturate(0.94);transition:filter .35s ease;
  }
  .svc-card:hover .svc-card__media__img{filter:saturate(1.04)}
  .svc-card__badge{
    position:absolute;top:12px;left:12px;z-index:2;
    background:var(--steel);color:var(--paper);
    padding:6px 10px;
    font-family:var(--body);font-size:9px;letter-spacing:0.32em;text-transform:uppercase;font-weight:600;
    opacity:0;transform:translateY(-4px);transition:opacity .3s ease, transform .3s var(--ease);
  }
  .svc-card.is-added .svc-card__badge{opacity:1;transform:none}

  .svc-card__body{
    padding:16px 18px 18px;
    display:flex;flex-direction:column;gap:8px;flex:1;
  }
  .svc-card__name{
    font-family:var(--display);font-weight:500;
    font-size:18px;line-height:1.2;color:var(--ink);letter-spacing:-0.005em;
  }
  .svc-card__desc{
    font-family:var(--body);font-size:12px;line-height:1.5;color:var(--graphite);
    flex:1;
  }
  .svc-card__foot{
    display:flex;justify-content:space-between;align-items:center;
    margin-top:6px;padding-top:12px;border-top:1px solid rgba(74,74,72,0.12);
  }
  .svc-card__price{
    font-family:var(--display);font-weight:500;
    font-size:20px;color:var(--ink);letter-spacing:-0.01em;
  }
  .svc-card__price small{font-family:var(--body);font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:var(--graphite);font-weight:500;margin-left:4px}
  .svc-card__add{
    font-family:var(--body);font-size:11px;font-weight:500;letter-spacing:0.22em;text-transform:uppercase;
    padding:8px 14px;border:1px solid var(--ink);color:var(--ink);background:transparent;
    transition:background .25s ease, color .25s ease, border-color .25s ease;
  }
  .svc-card:hover .svc-card__add{background:var(--ink);color:var(--paper)}
  .svc-card.is-added .svc-card__add{background:var(--steel);color:var(--paper);border-color:var(--steel)}
  .svc-card.is-added .svc-card__add::before{content:'\\2713 '}

  @media (max-width:1100px){.svc-grid{grid-template-columns:repeat(2,1fr)}}
  @media (max-width:760px){
    .svc-page{padding:32px var(--gutter) 140px}
    .svc-page__intro{flex-direction:column;align-items:flex-start;gap:12px;margin-bottom:32px}
    .cat{padding-top:32px}
    .cat__head{flex-direction:column;align-items:flex-start;gap:6px;padding-bottom:14px;margin-bottom:18px}
    .cat__head h3{font-size:28px}
    .svc-grid{grid-template-columns:repeat(2,1fr);gap:12px}
    .svc-card__media{aspect-ratio:5/4}
    .svc-card__name{font-size:15px}
    .svc-card__desc{font-size:11px}
    .svc-card__price{font-size:17px}
  }
  @media (max-width:440px){
    .svc-grid{grid-template-columns:1fr;gap:12px}
  }

  /* ---------- Floor-plan customiser ---------- */
  .fp-config{
    display:grid;grid-template-columns:1fr 1.05fr;
    gap:0;
    background:var(--paper);
    border:1px solid rgba(74,74,72,0.16);
    margin-bottom:24px;
    overflow:hidden;
  }
  .fp-config__media{position:relative;background:var(--soft);min-height:180px}
  .fp-config__img{
    position:absolute;inset:0;
    background-size:cover;background-position:center;
    filter:saturate(0.94);
    transition:background-image .4s ease, filter .35s ease;
  }
  .fp-config__body{
    padding:18px 22px;
    display:flex;flex-direction:column;gap:12px;
  }
  .fp-config__body h4{
    font-family:var(--display);font-weight:500;
    font-size:18px;color:var(--ink);line-height:1.1;letter-spacing:-0.005em;
  }
  .fp-config__body > p{font-size:11px;line-height:1.5;color:var(--graphite);max-width:420px;margin:0}

  .fp-group{display:flex;flex-direction:column;gap:6px}
  .fp-group > label{font-family:var(--body);font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:var(--graphite);font-weight:500}
  .fp-pills{display:flex;gap:6px;flex-wrap:wrap}
  .fp-pills button{
    font-family:var(--body);
    padding:7px 12px;
    border:1px solid rgba(74,74,72,0.22);background:transparent;color:var(--graphite);
    cursor:pointer;
    transition:background .25s ease, color .25s ease, border-color .25s ease;
    display:flex;flex-direction:column;align-items:flex-start;gap:0;line-height:1.1;
    font-size:11px;letter-spacing:0.16em;text-transform:uppercase;font-weight:600;
    text-align:left;
  }
  .fp-pills button small{
    font-family:var(--body);font-size:9px;letter-spacing:0.06em;
    color:inherit;opacity:0.6;text-transform:none;
    margin-top:1px;font-weight:400;
  }
  .fp-pills button:hover{border-color:var(--steel);color:var(--steel)}
  .fp-pills button.is-active{background:var(--steel);color:var(--paper);border-color:var(--steel)}
  .fp-pills button.is-active small{opacity:0.85}

  .fp-style-section{margin-top:6px}
  .fp-style-section + .fp-style-section{margin-top:10px}
  .fp-style-section__head{
    display:flex;justify-content:space-between;align-items:baseline;
    padding-top:6px;margin-bottom:6px;
    border-top:1px solid rgba(74,74,72,0.14);
  }
  .fp-style-section__name{
    font-family:var(--body);font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:var(--ink);font-weight:600;
  }
  .fp-style-section__name em{font-style:italic;color:var(--steel);font-weight:400}
  .fp-style-section__from{
    font-family:var(--body);font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:var(--steel);font-weight:500;
  }
  .fp-style-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
  .fp-style-grid--two{grid-template-columns:repeat(2,1fr)}
  .fp-style-card{
    display:flex;flex-direction:column;align-items:flex-start;gap:1px;
    padding:8px 12px;
    background:transparent;border:1px solid rgba(74,74,72,0.22);
    cursor:pointer;text-align:left;
    transition:background .25s ease, color .25s ease, border-color .25s ease;
  }
  .fp-style-card:hover{border-color:var(--steel);color:var(--steel)}
  .fp-style-card.is-active{background:var(--steel);color:var(--paper);border-color:var(--steel)}
  .fp-style-card__label{
    display:flex;flex-direction:column;gap:1px;
    font-family:var(--body);font-size:10px;letter-spacing:0.16em;text-transform:uppercase;font-weight:600;
    color:inherit;
  }
  .fp-style-card__label small{
    font-family:var(--body);font-size:9px;letter-spacing:0.04em;text-transform:none;font-weight:400;
    color:var(--graphite);
  }
  .fp-style-card:hover .fp-style-card__label small{color:var(--steel)}
  .fp-style-card.is-active .fp-style-card__label small{color:rgba(250,250,247,0.85)}
  @media (max-width:640px){
    .fp-style-grid{grid-template-columns:repeat(2,1fr)}
  }

  .fp-foot{
    display:flex;justify-content:space-between;align-items:center;gap:14px;
    margin-top:6px;padding-top:12px;border-top:1px solid rgba(74,74,72,0.14);
  }
  .fp-foot__label{display:block;font-family:var(--body);font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:var(--graphite);font-weight:500;margin-bottom:2px}
  .fp-foot__price{
    display:block;
    font-family:var(--display);font-weight:500;
    font-size:24px;color:var(--ink);letter-spacing:-0.01em;line-height:1;
  }
  .fp-add{
    position:relative;isolation:isolate;overflow:hidden;
    font-family:var(--body);font-size:11px;letter-spacing:0.22em;text-transform:uppercase;font-weight:500;
    color:var(--paper);background:transparent;border:1px solid var(--steel);
    padding:10px 16px;cursor:pointer;
    transition:color .4s var(--ease), border-color .4s var(--ease);
    white-space:nowrap;
  }
  .fp-add::before{
    content:'';position:absolute;inset:0;z-index:-1;
    background:var(--steel);
    transform:scaleX(1);transform-origin:right center;
    transition:transform .55s var(--ease);
  }
  .fp-add:hover{color:var(--steel)}
  .fp-add:hover::before{transform:scaleX(0);transform-origin:left center}

  .fp-sub{
    font-family:var(--body);font-size:11px;letter-spacing:0.22em;text-transform:uppercase;
    color:var(--steel);font-weight:500;
    margin:32px 0 14px;
    padding-top:8px;
  }

  @media (max-width:760px){
    .fp-config{grid-template-columns:1fr}
    .fp-config__media{min-height:160px}
    .fp-config__body{padding:16px 18px;gap:10px}
    .fp-foot{flex-direction:column;align-items:stretch;gap:10px}
    .fp-add{width:100%;text-align:center;padding:12px 16px}
    .fp-style-grid{grid-template-columns:repeat(2,1fr)}
    .fp-style-grid--two{grid-template-columns:repeat(2,1fr)}
    .fp-pills button{flex:1 1 auto}
  }

  /* ---------- Floating cart toggle (FAB) ---------- */
  .cart-fab{
    position:fixed;bottom:24px;right:24px;z-index:90;
    width:60px;height:60px;border-radius:50%;
    background:var(--steel);color:var(--paper);
    border:none;cursor:pointer;
    display:flex;align-items:center;justify-content:center;
    transition:background .25s ease, transform .35s var(--ease);
  }
  .cart-fab:hover{background:var(--steel-dark);transform:translateY(-2px) scale(1.04)}
  .cart-fab svg{width:22px;height:22px;display:block;position:relative;z-index:1}
  .cart-fab__count{
    position:absolute;top:-4px;right:-4px;z-index:2;
    min-width:22px;height:22px;padding:0 6px;
    background:var(--ink);color:var(--paper);border-radius:11px;
    font-family:var(--body);font-size:10px;font-weight:600;
    display:flex;align-items:center;justify-content:center;
    transform:scale(0);transition:transform .35s var(--ease);
    border:2px solid var(--paper);
  }
  .cart-fab.has-items .cart-fab__count{transform:scale(1)}
  .cart-fab__pulse,.cart-fab__pulse::before{
    position:absolute;inset:0;border-radius:50%;
    border:1px solid var(--steel);
    pointer-events:none;opacity:0;
  }
  .cart-fab__pulse::before{content:'';inset:0}
  .cart-fab.has-items .cart-fab__pulse{
    animation:cartPulse 2.4s ease-out infinite;
  }
  .cart-fab.has-items .cart-fab__pulse::before{
    animation:cartPulse 2.4s ease-out infinite;
    animation-delay:1.2s;
  }
  @keyframes cartPulse{
    0%{opacity:0.55;transform:scale(1)}
    100%{opacity:0;transform:scale(1.7)}
  }

  /* ---------- Cart widget ---------- */
  .cart{
    position:fixed;
    right:24px;bottom:96px;
    width:380px;max-width:calc(100vw - 32px);
    max-height:min(72vh, 640px);
    background:var(--paper);
    border:1px solid rgba(74,74,72,0.18);
    box-shadow:0 12px 40px rgba(10,10,10,0.18);
    z-index:95;
    display:flex;flex-direction:column;
    transform:translateY(16px) scale(0.96);
    transform-origin:bottom right;
    opacity:0;pointer-events:none;
    transition:opacity .3s ease, transform .35s var(--ease);
  }
  .cart.is-open{opacity:1;transform:none;pointer-events:auto}

  .cart__head{
    display:flex;justify-content:space-between;align-items:center;
    padding:16px 18px;border-bottom:1px solid rgba(74,74,72,0.14);
    flex-shrink:0;
  }
  .cart__head h3{font-family:var(--display);font-weight:500;font-size:20px;color:var(--ink);line-height:1;letter-spacing:-0.005em}
  .cart__head h3 em{font-style:italic;color:var(--steel);font-weight:400}
  .cart__close{
    width:32px;height:32px;
    border:1px solid rgba(74,74,72,0.25);background:transparent;cursor:pointer;
    display:flex;align-items:center;justify-content:center;font-size:18px;color:var(--ink);
    transition:background .25s ease, color .25s ease, border-color .25s ease;
  }
  .cart__close:hover{background:var(--ink);color:var(--paper);border-color:var(--ink)}

  .cart__scroll{flex:1;overflow-y:auto;padding:12px 18px;min-height:60px}
  .cart__empty{
    text-align:center;padding:28px 12px;color:var(--graphite);
  }
  .cart__empty h4{font-family:var(--display);font-weight:500;font-size:18px;color:var(--ink);margin-bottom:6px;letter-spacing:-0.005em}
  .cart__empty p{font-size:12px;line-height:1.55}

  .cart__list{display:flex;flex-direction:column;gap:0}
  .cart__item{
    display:grid;grid-template-columns:48px 1fr auto;gap:10px;align-items:center;
    padding:10px 0;border-top:1px solid rgba(74,74,72,0.1);
  }
  .cart__item:first-child{border-top:none}
  .cart__item__thumb{
    width:48px;height:48px;background:var(--soft) center/cover;
  }
  .cart__item__info{min-width:0}
  .cart__item__name{font-family:var(--display);font-weight:500;font-size:14px;color:var(--ink);line-height:1.2;letter-spacing:-0.005em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .cart__item__price{font-family:var(--body);font-size:11px;color:var(--graphite);margin-top:2px}
  .cart__item__remove{
    width:26px;height:26px;border:1px solid rgba(74,74,72,0.25);background:transparent;cursor:pointer;
    display:flex;align-items:center;justify-content:center;font-size:13px;color:var(--graphite);
    transition:border-color .2s ease, color .2s ease, background .2s ease;
  }
  .cart__item__remove:hover{border-color:var(--ink);color:var(--paper);background:var(--ink)}

  .cart__total{
    display:flex;justify-content:space-between;align-items:baseline;
    padding:14px 18px;border-top:1px solid rgba(74,74,72,0.18);
    background:var(--soft);
    flex-shrink:0;
  }
  .cart__total__label{font-family:var(--body);font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:var(--graphite);font-weight:500}
  .cart__total__amt{font-family:var(--display);font-weight:500;font-size:22px;color:var(--ink);letter-spacing:-0.01em}

  .cart__foot{
    padding:14px 18px 16px;
    border-top:1px solid rgba(74,74,72,0.14);
    flex-shrink:0;
  }

  .cart__submit{
    position:relative;isolation:isolate;overflow:hidden;
    margin-top:4px;
    font-family:var(--body);font-size:12px;letter-spacing:0.22em;text-transform:uppercase;font-weight:500;
    color:var(--paper);background:transparent;
    padding:14px 22px;border:1px solid var(--steel);
    cursor:pointer;width:100%;
    transition:color .4s var(--ease), border-color .4s var(--ease);
  }
  .cart__submit::before{
    content:'';position:absolute;inset:0;z-index:-1;
    background:var(--steel);
    transform:scaleX(1);transform-origin:right center;
    transition:transform .55s var(--ease);
  }
  .cart__submit:hover{color:var(--steel)}
  .cart__submit:hover::before{transform:scaleX(0);transform-origin:left center}
  .cart__submit:disabled{opacity:0.5;cursor:not-allowed}

  @media (max-width:560px){
    .cart-fab{bottom:18px;right:18px;width:54px;height:54px}
    .cart{
      right:14px;left:auto;bottom:82px;
      width:min(340px, calc(100vw - 28px));
      max-width:none;
      max-height:min(70vh, 540px);
    }
    .cart__head{padding:12px 14px}
    .cart__head h3{font-size:16px}
    .cart__scroll{padding:8px 14px}
    .cart__total{padding:10px 14px}
    .cart__total__amt{font-size:16px}
    .cart__foot{padding:10px 14px 12px}
    .cart__submit{padding:12px 16px;font-size:10px}
    .cart__item{grid-template-columns:32px 1fr auto;gap:8px;padding:8px 0}
    .cart__item__thumb{width:32px;height:32px}
    .cart__item__name{font-size:12px}
    .cart__item__price{font-size:10px}
  }
`}</style>

      <header className="nav">
        <div className="nav__brand">
          <Link href="/#top" aria-label="Won Vision — home"><Wordmark /></Link>
        </div>
        <nav className="nav__links">
          <Link href="/#services">Services</Link>
          <Link href="/#contact">Contact</Link>
          <Link href="/gallery">Gallery</Link>
        </nav>
        <div className="nav__right">
          <Link href="/book" className="nav__cta">Book now</Link>
        </div>
        <button className="nav__burger" aria-label="Menu"><span></span><span></span><span></span></button>
      </header>
      <aside className="nav__drawer" aria-hidden="true">
        <ul>
          <li><Link href="/#services">Services</Link></li>
          <li><Link href="/#contact">Contact</Link></li>
          <li><Link href="/gallery"><em>Gallery</em></Link></li>
          <li><Link href="/book" className="drawer-cta">Book now →</Link></li>
        </ul>
        <div className="nav__drawer__foot"><span>Won Vision</span><span>Melbourne · 2026</span></div>
      </aside>

      {/* L — TYPE-AS-WINDOW HEADER */}
      <section className="gallery-hero">
        <div className="gallery-hero__bg"></div>
        <div className="gallery-hero__veil"></div>

        <header className="gallery-hero__top">
          <span className="eyebrow">Won Vision · Book a shoot</span>
        </header>

        <div className="gallery-hero__big">
          <h1 className="typed">BOOK</h1>
        </div>
      </section>

      {/* SERVICE CATALOGUE */}
      <section className="svc-page">
        <div className="svc-page__intro">
          <div>
            <span className="eyebrow">Catalogue</span>
            <h2>Pick what your <em>listing needs.</em></h2>
          </div>
          <p>Categories below mirror the studio's full delivery list — packages, single-discipline shoots, post-production add-ons. All prices in AUD, GST inclusive.</p>
        </div>

        {/* PACKAGES */}
        <div className="cat" id="cat-packages" data-gallery="photography">
          <div className="cat__head"><h3>Packages</h3><span className="cat__count">6 options</span></div>
          <div className="svc-grid">

            <article className="svc-card" data-svc="Essential Package" data-price="299" data-desc="Photography only. Up to 25 stills, naturally lit, edited and delivered web-ready." data-img="https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?w=900&q=80">
              <div className="svc-card__media"><div className="svc-card__media__img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?w=900&q=80')" }}></div></div>
              <span className="svc-card__badge">In booking</span>
              <div className="svc-card__body">
                <h4 className="svc-card__name">Essential Package</h4>
                <p className="svc-card__desc">Photography only — 25 stills, naturally lit, edited and delivered web-ready.</p>
                <div className="svc-card__foot"><span className="svc-card__price">$299</span><span className="svc-card__add">Add +</span></div>
              </div>
            </article>

            <article className="svc-card" data-svc="Premium Package" data-price="375" data-desc="Photography + walkthrough video. The studio's most-booked listing kit." data-img="https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=900&q=80">
              <div className="svc-card__media"><div className="svc-card__media__img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=900&q=80')" }}></div></div>
              <span className="svc-card__badge">In booking</span>
              <div className="svc-card__body">
                <h4 className="svc-card__name">Premium Package</h4>
                <p className="svc-card__desc">Photography + walkthrough video. The studio's most-booked kit.</p>
                <div className="svc-card__foot"><span className="svc-card__price">$375</span><span className="svc-card__add">Add +</span></div>
              </div>
            </article>

            <article className="svc-card" data-svc="Social Media Lite Package" data-price="439" data-desc="Photography + a short reel cut for Instagram and TikTok." data-img="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&q=80">
              <div className="svc-card__media"><div className="svc-card__media__img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&q=80')" }}></div></div>
              <span className="svc-card__badge">In booking</span>
              <div className="svc-card__body">
                <h4 className="svc-card__name">Social Media Lite</h4>
                <p className="svc-card__desc">Photography + short reel cut for Instagram and TikTok.</p>
                <div className="svc-card__foot"><span className="svc-card__price">$439</span><span className="svc-card__add">Add +</span></div>
              </div>
            </article>

            <article className="svc-card" data-svc="Core Listing Package" data-price="549" data-desc="Photography, walkthrough video, drone aerial and floor plan in one shoot." data-img="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&q=80">
              <div className="svc-card__media"><div className="svc-card__media__img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&q=80')" }}></div></div>
              <span className="svc-card__badge">In booking</span>
              <div className="svc-card__body">
                <h4 className="svc-card__name">Core Listing</h4>
                <p className="svc-card__desc">Photography, walkthrough video, drone aerial and floor plan in one visit.</p>
                <div className="svc-card__foot"><span className="svc-card__price">$549</span><span className="svc-card__add">Add +</span></div>
              </div>
            </article>

            <article className="svc-card" data-svc="Signature Package" data-price="750" data-desc="The Core kit plus twilight photography and day-to-dusk hero edit." data-img="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80">
              <div className="svc-card__media"><div className="svc-card__media__img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80')" }}></div></div>
              <span className="svc-card__badge">In booking</span>
              <div className="svc-card__body">
                <h4 className="svc-card__name">Signature</h4>
                <p className="svc-card__desc">Core kit plus twilight photography and a day-to-dusk hero edit.</p>
                <div className="svc-card__foot"><span className="svc-card__price">$750</span><span className="svc-card__add">Add +</span></div>
              </div>
            </article>

            <article className="svc-card" data-svc="Elite Listing Package" data-price="1299" data-desc="Full delivery — Signature plus lifestyle reel, 3D floor plan and virtual tour." data-img="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80">
              <div className="svc-card__media"><div className="svc-card__media__img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80')" }}></div></div>
              <span className="svc-card__badge">In booking</span>
              <div className="svc-card__body">
                <h4 className="svc-card__name">Elite Listing</h4>
                <p className="svc-card__desc">Full delivery — Signature plus lifestyle reel, 3D floor plan and virtual tour.</p>
                <div className="svc-card__foot"><span className="svc-card__price">$1,299</span><span className="svc-card__add">Add +</span></div>
              </div>
            </article>

          </div>
        </div>

        {/* PHOTOGRAPHY */}
        <div className="cat" id="cat-photography" data-gallery="photography">
          <div className="cat__head"><h3>Photography</h3><span className="cat__count">4 options</span></div>
          <div className="svc-grid">

            <article className="svc-card" data-svc="Rental Photography" data-price="159" data-desc="Compact rental shoot — up to 12 naturally-lit stills, returned next day." data-img="https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=900&q=80">
              <div className="svc-card__media"><div className="svc-card__media__img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=900&q=80')" }}></div></div>
              <span className="svc-card__badge">In booking</span>
              <div className="svc-card__body">
                <h4 className="svc-card__name">Rental Photography</h4>
                <p className="svc-card__desc">Compact rental shoot — up to 12 stills, naturally lit, next-day delivery.</p>
                <div className="svc-card__foot"><span className="svc-card__price">$159</span><span className="svc-card__add">Add +</span></div>
              </div>
            </article>

            <article className="svc-card" data-svc="Sales Photography" data-price="189" data-desc="Standard sales shoot — up to 25 stills, hero exterior, kitchen detail study." data-img="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=80">
              <div className="svc-card__media"><div className="svc-card__media__img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=80')" }}></div></div>
              <span className="svc-card__badge">In booking</span>
              <div className="svc-card__body">
                <h4 className="svc-card__name">Sales Photography</h4>
                <p className="svc-card__desc">Up to 25 stills, hero exterior, kitchen and ensuite detail studies.</p>
                <div className="svc-card__foot"><span className="svc-card__price">$189</span><span className="svc-card__add">Add +</span></div>
              </div>
            </article>

            <article className="svc-card" data-svc="Aerial / Drone Photography" data-price="220" data-desc="CASA-licensed drone stills + 4K aerial video. Insured. Sub-250g for tight blocks." data-img="https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=900&q=80" data-gallery="drone">
              <div className="svc-card__media"><div className="svc-card__media__img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=900&q=80')" }}></div></div>
              <span className="svc-card__badge">In booking</span>
              <div className="svc-card__body">
                <h4 className="svc-card__name">Aerial / Drone</h4>
                <p className="svc-card__desc">CASA-licensed drone stills + 4K aerial video. Insured.</p>
                <div className="svc-card__foot"><span className="svc-card__price">$220</span><span className="svc-card__add">Add +</span></div>
              </div>
            </article>

            <article className="svc-card" data-svc="Agent Headshots" data-price="220" data-desc="A short on-location headshot session for the listing agent — three retouched looks." data-img="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=900&q=80">
              <div className="svc-card__media"><div className="svc-card__media__img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556228720-195a672e8a03?w=900&q=80')" }}></div></div>
              <span className="svc-card__badge">In booking</span>
              <div className="svc-card__body">
                <h4 className="svc-card__name">Agent Headshots</h4>
                <p className="svc-card__desc">On-location headshot session for the listing agent — three retouched looks.</p>
                <div className="svc-card__foot"><span className="svc-card__price">$220</span><span className="svc-card__add">Add +</span></div>
              </div>
            </article>

          </div>
        </div>

        {/* VIDEO */}
        <div className="cat" id="cat-video" data-gallery="video">
          <div className="cat__head"><h3>Video</h3><span className="cat__count">5 options</span></div>
          <div className="svc-grid">

            <article className="svc-card" data-svc="Listing Video" data-price="450" data-desc="Full edited listing video — gimbal walkthrough plus exterior, music-bedded." data-img="https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?w=900&q=80">
              <div className="svc-card__media"><div className="svc-card__media__img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?w=900&q=80')" }}></div></div>
              <span className="svc-card__badge">In booking</span>
              <div className="svc-card__body">
                <h4 className="svc-card__name">Listing Video</h4>
                <p className="svc-card__desc">Full edited video — gimbal walkthrough plus exterior, music-bedded.</p>
                <div className="svc-card__foot"><span className="svc-card__price">$450</span><span className="svc-card__add">Add +</span></div>
              </div>
            </article>

            <article className="svc-card" data-svc="Day to Night Listing Video" data-price="650" data-desc="Listing video plus a separate twilight pass — cuts the property's whole day." data-img="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80">
              <div className="svc-card__media"><div className="svc-card__media__img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80')" }}></div></div>
              <span className="svc-card__badge">In booking</span>
              <div className="svc-card__body">
                <h4 className="svc-card__name">Day to Night Video</h4>
                <p className="svc-card__desc">Listing video plus a separate twilight pass — full-day cut.</p>
                <div className="svc-card__foot"><span className="svc-card__price">$650</span><span className="svc-card__add">Add +</span></div>
              </div>
            </article>

            <article className="svc-card" data-svc="Social Media Reel" data-price="300" data-desc="Vertical-format reel cut for Instagram and TikTok with music + captions." data-img="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&q=80">
              <div className="svc-card__media"><div className="svc-card__media__img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&q=80')" }}></div></div>
              <span className="svc-card__badge">In booking</span>
              <div className="svc-card__body">
                <h4 className="svc-card__name">Social Media Reel</h4>
                <p className="svc-card__desc">Vertical reel cut for Instagram and TikTok with music + captions.</p>
                <div className="svc-card__foot"><span className="svc-card__price">$300</span><span className="svc-card__add">Add +</span></div>
              </div>
            </article>

            <article className="svc-card" data-svc="Social Media Walkthrough" data-price="87" data-desc="Quick vertical walkthrough — single take, lightly edited, ready in 24 hours." data-img="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=80">
              <div className="svc-card__media"><div className="svc-card__media__img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=80')" }}></div></div>
              <span className="svc-card__badge">In booking</span>
              <div className="svc-card__body">
                <h4 className="svc-card__name">Social Walkthrough</h4>
                <p className="svc-card__desc">Quick vertical walkthrough — single take, light edit, 24h turnaround.</p>
                <div className="svc-card__foot"><span className="svc-card__price">$87</span><span className="svc-card__add">Add +</span></div>
              </div>
            </article>

            <article className="svc-card" data-svc="Walkthrough with Intro & Agent Feature" data-price="121" data-desc="Social walkthrough opening with the agent piece-to-camera intro." data-img="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=900&q=80">
              <div className="svc-card__media"><div className="svc-card__media__img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556228720-195a672e8a03?w=900&q=80')" }}></div></div>
              <span className="svc-card__badge">In booking</span>
              <div className="svc-card__body">
                <h4 className="svc-card__name">Walkthrough + Agent Intro</h4>
                <p className="svc-card__desc">Social walkthrough opening with the agent piece-to-camera intro.</p>
                <div className="svc-card__foot"><span className="svc-card__price">$121</span><span className="svc-card__add">Add +</span></div>
              </div>
            </article>

          </div>
        </div>

        {/* VIRTUAL STAGING & EDITING */}
        <div className="cat" id="cat-staging" data-gallery="staging">
          <div className="cat__head"><h3>Virtual <em>staging &amp; editing</em></h3><span className="cat__count">3 options</span></div>
          <div className="svc-grid">

            <article className="svc-card" data-svc="Virtual Staging" data-price="25" data-desc="Empty-room digital staging — architectural furniture, photoreal. Per image." data-img="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=80">
              <div className="svc-card__media"><div className="svc-card__media__img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=80')" }}></div></div>
              <span className="svc-card__badge">In booking</span>
              <div className="svc-card__body">
                <h4 className="svc-card__name">Virtual Staging</h4>
                <p className="svc-card__desc">Empty-room digital staging — architectural furniture, photoreal.</p>
                <div className="svc-card__foot"><span className="svc-card__price">$25 <small>/ img</small></span><span className="svc-card__add">Add +</span></div>
              </div>
            </article>

            <article className="svc-card" data-svc="Decluttering / Object Removal" data-price="10" data-desc="Declutter stills in post — bins, cars, signage, family items removed. Per image." data-img="https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=900&q=80">
              <div className="svc-card__media"><div className="svc-card__media__img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=900&q=80')" }}></div></div>
              <span className="svc-card__badge">In booking</span>
              <div className="svc-card__body">
                <h4 className="svc-card__name">Object Removal</h4>
                <p className="svc-card__desc">Declutter stills in post — bins, cars, signage, family items.</p>
                <div className="svc-card__foot"><span className="svc-card__price">$10 <small>/ img</small></span><span className="svc-card__add">Add +</span></div>
              </div>
            </article>

            <article className="svc-card" data-svc="Day to Dusk" data-price="5" data-desc="Convert a daytime exterior into a single hero twilight frame. Per image." data-img="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80">
              <div className="svc-card__media"><div className="svc-card__media__img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80')" }}></div></div>
              <span className="svc-card__badge">In booking</span>
              <div className="svc-card__body">
                <h4 className="svc-card__name">Day to Dusk</h4>
                <p className="svc-card__desc">Convert a daytime exterior into a hero twilight frame.</p>
                <div className="svc-card__foot"><span className="svc-card__price">$5 <small>/ img</small></span><span className="svc-card__add">Add +</span></div>
              </div>
            </article>

          </div>
        </div>

        {/* FLOORPLANS */}
        <div className="cat" id="cat-floorplans" data-gallery="floorplans">
          <div className="cat__head"><h3>Floor <em>plans</em></h3><span className="cat__count">Customisable</span></div>

          <div className="fp-config">
            <div className="fp-config__media">
              <div className="fp-config__img" id="fpImg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80')" }}></div>
            </div>
            <div className="fp-config__body">
              <div className="fp-group">
                <label>Size</label>
                <div className="fp-pills" data-fp="size">
                  <button type="button" data-value="small">Small<small>up to 200m²</small></button>
                  <button type="button" data-value="medium" className="is-active">Medium<small>200–300m²</small></button>
                  <button type="button" data-value="large">Large<small>300–500m²</small></button>
                  <button type="button" data-value="xl">XL<small>500m²+</small></button>
                </div>
              </div>

              <div className="fp-group">
                <label>Style</label>

                <div className="fp-style-section">
                  <div className="fp-style-section__head">
                    <span className="fp-style-section__name">Line work</span>
                    <span className="fp-style-section__from">From $159</span>
                  </div>
                  <div className="fp-style-grid" data-fp="style">
                    <button type="button" className="fp-style-card is-active" data-value="2d-basic">
                      <span className="fp-style-card__label">Standard <small>Black &amp; white</small></span>
                    </button>
                    <button type="button" className="fp-style-card" data-value="2d-site">
                      <span className="fp-style-card__label">With site <small>Landscape context</small></span>
                    </button>
                    <button type="button" className="fp-style-card" data-value="2d-colour">
                      <span className="fp-style-card__label">Coloured <small>Subtle wash</small></span>
                    </button>
                  </div>
                </div>

                <div className="fp-style-section">
                  <div className="fp-style-section__head">
                    <span className="fp-style-section__name">Render</span>
                    <span className="fp-style-section__from">From $199</span>
                  </div>
                  <div className="fp-style-grid fp-style-grid--two" data-fp="style">
                    <button type="button" className="fp-style-card" data-value="render-2d">
                      <span className="fp-style-card__label">2D <small>Shaded plan view</small></span>
                    </button>
                    <button type="button" className="fp-style-card" data-value="render-3d">
                      <span className="fp-style-card__label">3D <small>Dollhouse · photoreal</small></span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="fp-foot">
                <div>
                  <span className="fp-foot__label">Subtotal · GST inc.</span>
                  <span className="fp-foot__price" id="fpPrice">$199</span>
                </div>
                <button type="button" className="fp-add" id="fpAdd">Add to booking →</button>
              </div>
            </div>
          </div>

          <h5 className="fp-sub">Redraws &amp; site plan · post-production add-ons</h5>
          <div className="svc-grid">

            <article className="svc-card" data-svc="Basic Floorplan Redraw" data-price="30" data-desc="Redraw an existing plan in Won Vision linework. Per page." data-img="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80">
              <div className="svc-card__media"><div className="svc-card__media__img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80')" }}></div></div>
              <span className="svc-card__badge">In booking</span>
              <div className="svc-card__body">
                <h4 className="svc-card__name">Floorplan Redraw</h4>
                <p className="svc-card__desc">Redraw an existing plan in Won Vision linework. Per page.</p>
                <div className="svc-card__foot"><span className="svc-card__price">$30</span><span className="svc-card__add">Add +</span></div>
              </div>
            </article>

            <article className="svc-card" data-svc="Floorplan Redraw with Site Plan" data-price="45" data-desc="Redraw plus matched site plan with boundaries and orientation." data-img="https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=900&q=80">
              <div className="svc-card__media"><div className="svc-card__media__img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=900&q=80')" }}></div></div>
              <span className="svc-card__badge">In booking</span>
              <div className="svc-card__body">
                <h4 className="svc-card__name">Redraw + Site Plan</h4>
                <p className="svc-card__desc">Redraw plus matched site plan with boundaries and orientation.</p>
                <div className="svc-card__foot"><span className="svc-card__price">$45</span><span className="svc-card__add">Add +</span></div>
              </div>
            </article>

            <article className="svc-card" data-svc="Site Plan only" data-price="89" data-desc="Standalone site plan — boundaries, orientation, lot dimensions." data-img="https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=900&q=80">
              <div className="svc-card__media"><div className="svc-card__media__img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=900&q=80')" }}></div></div>
              <span className="svc-card__badge">In booking</span>
              <div className="svc-card__body">
                <h4 className="svc-card__name">Site Plan only</h4>
                <p className="svc-card__desc">Standalone site plan — boundaries, orientation, lot dimensions.</p>
                <div className="svc-card__foot"><span className="svc-card__price">$89</span><span className="svc-card__add">Add +</span></div>
              </div>
            </article>

          </div>
        </div>

        {/* ADD-ONS */}
        <div className="cat" id="cat-addons" data-gallery="photography">
          <div className="cat__head"><h3>Add-ons</h3><span className="cat__count">1 option</span></div>
          <div className="svc-grid">

            <article className="svc-card" data-svc="Twilight Add-On" data-price="75" data-desc="Add a 30-minute twilight pass to any same-day shoot." data-img="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80">
              <div className="svc-card__media"><div className="svc-card__media__img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80')" }}></div></div>
              <span className="svc-card__badge">In booking</span>
              <div className="svc-card__body">
                <h4 className="svc-card__name">Twilight Add-On</h4>
                <p className="svc-card__desc">Add a 30-minute twilight pass to any same-day shoot.</p>
                <div className="svc-card__foot"><span className="svc-card__price">$75</span><span className="svc-card__add">Add +</span></div>
              </div>
            </article>

          </div>
        </div>
      </section>

      {/* Floating cart toggle */}
      <button className="cart-fab" id="cartFab" aria-label="Open booking cart">
        <span className="cart-fab__pulse" aria-hidden="true"></span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 5h2l2.4 11.2a2 2 0 002 1.6h8.6a2 2 0 002-1.6L22 8H6" />
          <circle cx="9" cy="20" r="1.2" />
          <circle cx="18" cy="20" r="1.2" />
        </svg>
        <span className="cart-fab__count" id="cartCount">0</span>
      </button>

      {/* Cart widget */}
      <aside className="cart" id="cart" aria-hidden="true">
        <header className="cart__head">
          <h3>Your <em>booking</em></h3>
          <button className="cart__close" id="cartClose" aria-label="Close">×</button>
        </header>

        <div className="cart__scroll" id="cartScroll">
          <div className="cart__empty" id="cartEmpty">
            <h4>No services yet.</h4>
            <p>Tap any card to add it. Cart fills as you go.</p>
          </div>
          <div className="cart__list" id="cartList" hidden></div>
        </div>

        <div className="cart__total" id="cartTotal" hidden>
          <span className="cart__total__label">Subtotal · GST inc.</span>
          <span className="cart__total__amt" id="cartAmt">$0</span>
        </div>

        <div className="cart__foot">
          <button type="button" className="cart__submit" id="cartNext" disabled>Next →</button>
        </div>
      </aside>

      <footer className="foot">
        <div className="foot__inner">
          <div className="foot__top">
            <div>
              <Link href="/#top" data-home aria-label="Won Vision — home"><Wordmark /></Link>
              <p>A Melbourne property media studio. Photography, video, drone, floor plans, virtual staging. Your listing the star, we make it go far.</p>
            </div>
            <div>
              <h4>Studio</h4>
              <ul>
                <li><Link href="/#services">Services</Link></li>
                <li><Link href="/gallery">Gallery</Link></li>
                <li><Link href="/book">Book now</Link></li>
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

      {/* Booking cart logic */}
      <Script id="wv-book-cart" strategy="afterInteractive">{`
(function(){
  const cards   = document.querySelectorAll('.svc-card');
  const fab     = document.getElementById('cartFab');
  const count   = document.getElementById('cartCount');
  const cart    = document.getElementById('cart');
  const close   = document.getElementById('cartClose');
  const list    = document.getElementById('cartList');
  const empty   = document.getElementById('cartEmpty');
  const total   = document.getElementById('cartTotal');
  const amt     = document.getElementById('cartAmt');
  const next    = document.getElementById('cartNext');
  if(!cards.length || !fab) return;

  const items = new Map();

  try {
    const saved = JSON.parse(sessionStorage.getItem('wv-cart') || '[]');
    saved.forEach(it => {
      items.set(it.name, {price: String(it.price), img: it.img});
      const card = Array.from(cards).find(c => c.dataset.svc === it.name);
      if (card) card.classList.add('is-added');
    });
  } catch (_) {}

  function persist(){
    try {
      const payload = Array.from(items.entries()).map(([name, data]) => ({
        name, price: Number(data.price) || 0, img: data.img,
      }));
      sessionStorage.setItem('wv-cart', JSON.stringify(payload));
    } catch (_) {}
  }

  function fmt(n){ return '$' + Number(n).toLocaleString('en-AU'); }

  function render(){
    const n = items.size;
    count.textContent = String(n);
    fab.classList.toggle('has-items', n > 0);
    if(next) next.disabled = (n === 0);
    empty.style.display = n === 0 ? '' : 'none';
    list.hidden = n === 0;
    total.hidden = n === 0;

    let subtotal = 0;
    list.innerHTML = '';
    items.forEach((data, name) => {
      subtotal += Number(data.price) || 0;
      const row = document.createElement('div');
      row.className = 'cart__item';
      const priceLabel = (Number(data.price) === 0) ? 'POA' : fmt(data.price);
      row.innerHTML = \`
        <div class="cart__item__thumb" style="background-image:url('\${data.img}')"></div>
        <div class="cart__item__info">
          <div class="cart__item__name">\${name}</div>
          <div class="cart__item__price">\${priceLabel}</div>
        </div>
        <button type="button" class="cart__item__remove" aria-label="Remove">×</button>
      \`;
      row.querySelector('.cart__item__remove').addEventListener('click', () => {
        toggleCard(name, false);
      });
      list.appendChild(row);
    });
    amt.textContent = subtotal === 0 ? '$0' : fmt(subtotal);
    persist();
  }

  function findCard(name){
    return Array.from(cards).find(c => c.dataset.svc === name);
  }

  function toggleCard(name, force){
    const card = findCard(name);
    const isAdded = items.has(name);
    const nextState = (typeof force === 'boolean') ? force : !isAdded;
    if(nextState && card){
      items.set(name, {price: card.dataset.price, img: card.dataset.img});
      card.classList.add('is-added');
      openCart();
    } else {
      items.delete(name);
      if(card) card.classList.remove('is-added');
    }
    render();
  }

  cards.forEach(card => {
    card.addEventListener('click', () => toggleCard(card.dataset.svc));
  });

  // Floor-plan customiser
  (function(){
    const priceMatrix = {
      small:  {linework: 159, render2d: 199, render3d: 239},
      medium: {linework: 199, render2d: 249, render3d: 299},
      large:  {linework: 239, render2d: 299, render3d: 359},
      xl:     {linework: 0,   render2d: 0,   render3d: 0},
    };
    const sizeLabel  = {small:'Small', medium:'Medium', large:'Large', xl:'XL'};
    const styleMap = {
      '2d-basic':  { group:'linework', label:'Line work · Standard',  img:'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80' },
      '2d-site':   { group:'linework', label:'Line work · With site', img:'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=1200&q=80' },
      '2d-colour': { group:'linework', label:'Line work · Coloured',  img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80' },
      'render-2d': { group:'render2d', label:'Render · 2D',           img:'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80' },
      'render-3d': { group:'render3d', label:'Render · 3D dollhouse', img:'https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?w=1200&q=80' },
    };

    const state = { size: 'medium', style: '2d-basic' };
    const priceEl = document.getElementById('fpPrice');
    const imgEl   = document.getElementById('fpImg');
    const addBtn  = document.getElementById('fpAdd');

    function updatePrice(){
      const group = styleMap[state.style].group;
      const p = priceMatrix[state.size][group];
      priceEl.textContent = p === 0 ? 'POA' : '$' + Number(p).toLocaleString('en-AU');
    }
    function updateImg(){
      if(imgEl) imgEl.style.backgroundImage = \`url('\${styleMap[state.style].img}')\`;
    }

    document.querySelectorAll('.fp-pills[data-fp="size"]').forEach(group => {
      group.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          group.querySelectorAll('button').forEach(b => b.classList.remove('is-active'));
          btn.classList.add('is-active');
          state.size = btn.dataset.value;
          updatePrice();
        });
      });
    });

    const allStyleCards = document.querySelectorAll('.fp-style-card');
    allStyleCards.forEach(card => {
      card.addEventListener('click', () => {
        allStyleCards.forEach(c => c.classList.remove('is-active'));
        card.classList.add('is-active');
        state.style = card.dataset.value;
        updatePrice();
        updateImg();
      });
    });

    if(addBtn){
      addBtn.addEventListener('click', () => {
        Array.from(items.keys()).forEach(k => {
          if(k.startsWith('Floor plan —')) items.delete(k);
        });
        const styleInfo = styleMap[state.style];
        const name = \`Floor plan — \${sizeLabel[state.size]} · \${styleInfo.label}\`;
        const price = priceMatrix[state.size][styleInfo.group];
        items.set(name, { price: String(price), img: styleInfo.img });
        render();
        openCart();
      });
    }
  })();

  function openCart(){ cart.classList.add('is-open'); cart.setAttribute('aria-hidden','false'); fab.classList.add('is-open'); }
  function closeCart(){ cart.classList.remove('is-open'); cart.setAttribute('aria-hidden','true'); fab.classList.remove('is-open'); }

  fab.addEventListener('click', () => {
    cart.classList.contains('is-open') ? closeCart() : openCart();
  });
  close.addEventListener('click', closeCart);
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && cart.classList.contains('is-open')) closeCart();
  });

  if(next){
    next.addEventListener('click', () => {
      if(items.size === 0) return;
      persist();
      window.location.href = '/book/checkout';
    });
  }

  render();
})();
`}</Script>
      <ServiceGalleryLightbox />
    </>
  );
}
