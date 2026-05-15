import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { Wordmark } from '../components/Wordmark';
import ServiceGalleryLightbox from '../components/ServiceGalleryLightbox';
import BeforeAfterSlider from '../components/BeforeAfterSlider';

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

  /* ---------- Before/after comparison sliders ---------- */
  .ba-row{
    display:grid;grid-template-columns:repeat(3,1fr);gap:18px;
    margin-top:8px;
  }
  @media (max-width:900px){
    .ba-row{grid-template-columns:1fr;gap:14px}
  }
  .ba-slider{margin:0;display:flex;flex-direction:column;gap:10px}
  .ba-slider__frame{
    position:relative;width:100%;aspect-ratio:4/3;
    background:var(--soft);overflow:hidden;
    border:1px solid var(--border);
    user-select:none;touch-action:none;cursor:ew-resize;
  }
  .ba-slider__img{
    position:absolute;inset:0;width:100%;height:100%;
    object-fit:cover;display:block;pointer-events:none;
  }
  .ba-slider__before-clip{
    position:absolute;inset:0;will-change:clip-path;
  }
  .ba-slider__tag{
    position:absolute;top:10px;
    font-family:var(--body);font-size:10px;letter-spacing:0.22em;
    text-transform:uppercase;font-weight:600;
    padding:5px 9px;background:var(--ink);color:var(--paper);
    pointer-events:none;z-index:3;
  }
  .ba-slider__tag--before{left:10px}
  .ba-slider__tag--after{right:10px;background:var(--paper);color:var(--ink);border:1px solid var(--ink)}
  .ba-slider__divider{
    position:absolute;top:0;bottom:0;width:2px;
    background:var(--paper);
    transform:translateX(-50%);
    z-index:4;outline:none;cursor:ew-resize;
    box-shadow:0 0 0 1px rgba(0,0,0,0.18);
  }
  .ba-slider__divider:focus-visible{box-shadow:0 0 0 2px var(--ink)}
  .ba-slider__handle{
    position:absolute;top:50%;left:50%;
    transform:translate(-50%,-50%);
    width:40px;height:40px;background:var(--paper);
    border:1px solid var(--ink);
    display:flex;align-items:center;justify-content:center;
    gap:2px;font-family:var(--body);
    color:var(--ink);font-size:18px;line-height:1;
    pointer-events:none;
  }
  .ba-slider__handle-arrow{font-weight:600}
  .ba-slider__label{
    font-family:var(--body);font-size:11px;letter-spacing:0.22em;
    text-transform:uppercase;color:var(--ink);font-weight:600;
    text-align:center;
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

  /* ---------- Packages ---------- */
  .pkg-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
  .pkg-card{
    display:flex;flex-direction:column;
    background:var(--paper);
    border:1px solid rgba(74,74,72,0.16);
    overflow:hidden;
    transition:border-color .25s ease, transform .35s var(--ease);
    scroll-margin-top:120px;
  }
  .pkg-card:hover{border-color:var(--ink);transform:translateY(-3px)}
  .pkg-card.is-target{border-color:var(--steel);box-shadow:0 12px 40px rgba(10,10,10,0.12)}
  .pkg-card__media{aspect-ratio:5/3;background:var(--soft);overflow:hidden;position:relative}
  .pkg-card__media__img{position:absolute;inset:0;background-size:cover;background-position:center;filter:saturate(0.94)}
  .pkg-card__tag{
    position:absolute;top:12px;left:12px;z-index:2;
    background:var(--ink);color:var(--paper);
    padding:6px 10px;
    font-family:var(--body);font-size:9px;letter-spacing:0.32em;text-transform:uppercase;font-weight:600;
  }
  .pkg-card__body{padding:18px 20px 20px;display:flex;flex-direction:column;gap:12px;flex:1}
  .pkg-card__name{font-family:var(--display);font-weight:500;font-size:22px;line-height:1.1;color:var(--ink);letter-spacing:-0.005em}
  .pkg-card__name em{font-style:italic;color:var(--steel);font-weight:400}
  .pkg-card__desc{font-family:var(--body);font-size:12px;line-height:1.55;color:var(--graphite)}
  .pkg-card__incl{font-family:var(--body);font-size:11px;line-height:1.6;color:var(--ink);margin:0;padding:0;list-style:none}
  .pkg-card__incl li{padding:4px 0;border-top:1px solid rgba(74,74,72,0.1)}
  .pkg-card__incl li:first-child{border-top:none}
  .pkg-card__pricerow{
    display:flex;align-items:baseline;gap:8px;padding-top:10px;border-top:1px solid rgba(74,74,72,0.12)
  }
  .pkg-card__from{font-family:var(--body);font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:var(--graphite);font-weight:500}
  .pkg-card__price{font-family:var(--display);font-weight:500;font-size:26px;color:var(--ink);letter-spacing:-0.01em;line-height:1}
  .pkg-card__list{font-family:var(--body);font-size:12px;color:var(--graphite);text-decoration:line-through;font-weight:500}
  .pkg-card__tiers{display:flex;flex-direction:column;gap:6px}
  .pkg-card__tiers > label{font-family:var(--body);font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:var(--graphite);font-weight:500}
  .pkg-card__pills{display:flex;gap:6px;flex-wrap:wrap}
  .pkg-card__pills button{
    flex:1 1 0;min-width:0;
    font-family:var(--body);font-size:11px;letter-spacing:0.14em;text-transform:uppercase;font-weight:500;
    padding:10px 8px;border:1px solid rgba(74,74,72,0.2);background:transparent;color:var(--ink);cursor:pointer;
    display:flex;flex-direction:column;align-items:center;gap:2px;line-height:1.1;
    transition:background .25s ease, color .25s ease, border-color .25s ease;
  }
  .pkg-card__pills button small{font-size:9px;letter-spacing:0.18em;color:var(--graphite);font-weight:500}
  .pkg-card__pills button:hover{border-color:var(--ink)}
  .pkg-card__pills button.is-active{background:var(--ink);color:var(--paper);border-color:var(--ink)}
  .pkg-card__pills button.is-active small{color:rgba(250,250,247,0.85)}
  .pkg-card__add{
    position:relative;isolation:isolate;overflow:hidden;
    margin-top:4px;
    font-family:var(--body);font-size:11px;letter-spacing:0.22em;text-transform:uppercase;font-weight:500;
    color:var(--paper);background:transparent;border:1px solid var(--ink);
    padding:13px 18px;cursor:pointer;
    transition:color .4s var(--ease), border-color .4s var(--ease);
  }
  .pkg-card__add::before{
    content:'';position:absolute;inset:0;z-index:-1;
    background:var(--ink);
    transform:scaleX(1);transform-origin:right center;
    transition:transform .55s var(--ease);
  }
  .pkg-card__add:hover{color:var(--ink)}
  .pkg-card__add:hover::before{transform:scaleX(0);transform-origin:left center}
  .pkg-card.is-added .pkg-card__add{color:var(--paper);border-color:var(--steel)}
  .pkg-card.is-added .pkg-card__add::before{background:var(--steel);transform:scaleX(1) !important;transform-origin:left center}
  .pkg-card.is-added .pkg-card__add::after{content:' ✓'}
  @media (max-width:1100px){.pkg-grid{grid-template-columns:repeat(2,1fr)}}
  @media (max-width:760px){
    .pkg-grid{grid-template-columns:1fr;gap:14px}
    .pkg-card__name{font-size:19px}
    .pkg-card__price{font-size:22px}
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
        </div>

        {/* PACKAGES */}
        <div className="cat" id="cat-packages" data-gallery="photography">
          <div className="cat__head"><h3><em>Packages</em></h3><span className="cat__count">3 bundles · pick a tier</span></div>
          <p style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--graphite)', maxWidth: 640, marginBottom: 18 }}>
            Bundled offerings that combine our most-requested services at significant savings versus à la carte. Pick a package, choose the property tier — we handle the rest. <strong>20% launch promo applied at checkout</strong> until 31 December 2026.
          </p>

          <div className="pkg-grid">

            <article
              className="pkg-card"
              data-pkg="showcase"
              data-pkg-name="Showcase"
              data-pkg-img="https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?w=1200&q=85"
              data-tiers='{"compact":{"label":"Compact · 1–2 bed","price":350,"promo":280},"standard":{"label":"Standard · 3–4 bed","price":450,"promo":360},"premium":{"label":"Premium · 5+ bed","price":550,"promo":440}}'
            >
              <div className="pkg-card__media">
                <span className="pkg-card__tag">Most booked</span>
                <div className="pkg-card__media__img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?w=1200&q=85')" }}></div>
              </div>
              <div className="pkg-card__body">
                <h4 className="pkg-card__name">Showcase</h4>
                <p className="pkg-card__desc">Photos, floor plan, and aerial context in one shoot — the standard suburban listing bundle.</p>
                <ul className="pkg-card__incl">
                  <li>15 / 20 / 25 HDR photos (by tier)</li>
                  <li>2D floor plan with dimensions</li>
                  <li>Drone set — 5 edited images</li>
                  <li>Next-business-day delivery</li>
                </ul>
                <div className="pkg-card__tiers">
                  <label>Property size</label>
                  <div className="pkg-card__pills" data-pkg-tiers>
                    <button type="button" data-tier="compact" className="is-active">Compact<small>1–2 bed</small></button>
                    <button type="button" data-tier="standard">Standard<small>3–4 bed</small></button>
                    <button type="button" data-tier="premium">Premium<small>5+ bed</small></button>
                  </div>
                </div>
                <div className="pkg-card__pricerow">
                  <span className="pkg-card__from">From</span>
                  <span className="pkg-card__price" data-pkg-price>$280</span>
                  <span className="pkg-card__list" data-pkg-list>$350</span>
                </div>
                <button type="button" className="pkg-card__add" data-pkg-add>Add to booking →</button>
              </div>
            </article>

            <article
              className="pkg-card"
              data-pkg="signature"
              data-pkg-name="Signature"
              data-pkg-img="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=85"
              data-tiers='{"compact":{"label":"Compact · 1–2 bed","price":675,"promo":540},"standard":{"label":"Standard · 3–4 bed","price":750,"promo":600},"premium":{"label":"Premium · 5+ bed","price":825,"promo":660}}'
            >
              <div className="pkg-card__media">
                <span className="pkg-card__tag">Complete deliverable</span>
                <div className="pkg-card__media__img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=85')" }}></div>
              </div>
              <div className="pkg-card__body">
                <h4 className="pkg-card__name">Signature</h4>
                <p className="pkg-card__desc">Photo + plan + drone + a full listing video — the complete agent deliverable.</p>
                <ul className="pkg-card__incl">
                  <li>15 / 20 / 25 HDR photos (by tier)</li>
                  <li>2D floor plan + 5-image drone set</li>
                  <li>Listing Video 16:9 · 40 / 50 / 60s</li>
                  <li>2-business-day video delivery</li>
                </ul>
                <div className="pkg-card__tiers">
                  <label>Property size</label>
                  <div className="pkg-card__pills" data-pkg-tiers>
                    <button type="button" data-tier="compact" className="is-active">Compact<small>1–2 bed</small></button>
                    <button type="button" data-tier="standard">Standard<small>3–4 bed</small></button>
                    <button type="button" data-tier="premium">Premium<small>5+ bed</small></button>
                  </div>
                </div>
                <div className="pkg-card__pricerow">
                  <span className="pkg-card__from">From</span>
                  <span className="pkg-card__price" data-pkg-price>$540</span>
                  <span className="pkg-card__list" data-pkg-list>$675</span>
                </div>
                <button type="button" className="pkg-card__add" data-pkg-add>Add to booking →</button>
              </div>
            </article>

            <article
              className="pkg-card"
              data-pkg="cinematic"
              data-pkg-name="Cinematic"
              data-pkg-img="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=85"
              data-tiers='{"compact":{"label":"Compact · 1–2 bed","price":1100,"promo":880},"standard":{"label":"Standard · 3–4 bed","price":1200,"promo":960},"premium":{"label":"Premium · 5+ bed","price":1300,"promo":1040}}'
            >
              <div className="pkg-card__media">
                <span className="pkg-card__tag">Flagship</span>
                <div className="pkg-card__media__img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=85')" }}></div>
              </div>
              <div className="pkg-card__body">
                <h4 className="pkg-card__name">Cinematic</h4>
                <p className="pkg-card__desc">Luxury listing presentation — twilight imagery and a 90-second cinematic film.</p>
                <ul className="pkg-card__incl">
                  <li>15 / 20 / 25 HDR photos (by tier)</li>
                  <li>2D floor plan + 5-image drone set</li>
                  <li>90s premium cinematic, full grade</li>
                  <li>5 twilight images · priority editing</li>
                </ul>
                <div className="pkg-card__tiers">
                  <label>Property size</label>
                  <div className="pkg-card__pills" data-pkg-tiers>
                    <button type="button" data-tier="compact" className="is-active">Compact<small>1–2 bed</small></button>
                    <button type="button" data-tier="standard">Standard<small>3–4 bed</small></button>
                    <button type="button" data-tier="premium">Premium<small>5+ bed</small></button>
                  </div>
                </div>
                <div className="pkg-card__pricerow">
                  <span className="pkg-card__from">From</span>
                  <span className="pkg-card__price" data-pkg-price>$880</span>
                  <span className="pkg-card__list" data-pkg-list>$1,100</span>
                </div>
                <button type="button" className="pkg-card__add" data-pkg-add>Add to booking →</button>
              </div>
            </article>

          </div>
        </div>

        {/* RENTAL PHOTOGRAPHY */}
        <div className="cat" id="cat-rental" data-gallery="photography">
          <div className="cat__head"><h3>Rental <em>photography</em></h3><span className="cat__count">3 tiers</span></div>
          <div className="svc-grid">

            <article className="svc-card" data-svc="Rental Compact (Studio / 1BR)" data-price="180" data-desc="Studio or 1-bedroom rental — 8 HDR photos, basic editing, sky correction, next-business-day delivery." data-img="https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=900&q=80">
              <div className="svc-card__media"><div className="svc-card__media__img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=900&q=80')" }}></div></div>
              <span className="svc-card__badge">In booking</span>
              <div className="svc-card__body">
                <h4 className="svc-card__name">Rental Compact</h4>
                <p className="svc-card__desc">Studio / 1BR — 8 HDR photos, sky correction, next-day delivery.</p>
                <div className="svc-card__foot"><span className="svc-card__price">$180</span><span className="svc-card__add">Add +</span></div>
              </div>
            </article>

            <article className="svc-card" data-svc="Rental Standard (2BR)" data-price="220" data-desc="2-bedroom rental — 10 HDR photos, basic editing, sky correction, next-business-day delivery." data-img="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=80">
              <div className="svc-card__media"><div className="svc-card__media__img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=80')" }}></div></div>
              <span className="svc-card__badge">In booking</span>
              <div className="svc-card__body">
                <h4 className="svc-card__name">Rental Standard</h4>
                <p className="svc-card__desc">2BR — 10 HDR photos, sky correction, next-day delivery.</p>
                <div className="svc-card__foot"><span className="svc-card__price">$220</span><span className="svc-card__add">Add +</span></div>
              </div>
            </article>

            <article className="svc-card" data-svc="Rental Large (3BR+)" data-price="260" data-desc="3-bedroom-plus rental — 12 HDR photos, basic editing, sky correction, next-business-day delivery." data-img="https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=900&q=80">
              <div className="svc-card__media"><div className="svc-card__media__img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=900&q=80')" }}></div></div>
              <span className="svc-card__badge">In booking</span>
              <div className="svc-card__body">
                <h4 className="svc-card__name">Rental Large</h4>
                <p className="svc-card__desc">3BR+ — 12 HDR photos, sky correction, next-day delivery.</p>
                <div className="svc-card__foot"><span className="svc-card__price">$260</span><span className="svc-card__add">Add +</span></div>
              </div>
            </article>

          </div>
        </div>

        {/* SALES PHOTOGRAPHY */}
        <div className="cat" id="cat-sales" data-gallery="photography">
          <div className="cat__head"><h3>Sales <em>photography</em></h3><span className="cat__count">3 tiers · photo-only</span></div>
          <p style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--graphite)', maxWidth: 640, marginBottom: 18 }}>
            Pure photography pricing by property size. Full HDR retouching, sky replacement and agent-facing licensing included. Floor plan, drone, twilight and video available as add-ons below — or bundle them at 18–29% off via Packages above.
          </p>
          <div className="svc-grid">

            <article className="svc-card" data-svc="Sales Compact (1–2 bed)" data-price="195" data-desc="1–2 bed sales shoot — 15 HDR photos, full retouching, sky replacement, next-business-day delivery, agent-facing licensing." data-img="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=80">
              <div className="svc-card__media"><div className="svc-card__media__img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=80')" }}></div></div>
              <span className="svc-card__badge">In booking</span>
              <div className="svc-card__body">
                <h4 className="svc-card__name">Sales Compact</h4>
                <p className="svc-card__desc">1–2 bed · 15 HDR photos · full retouching · sky replacement.</p>
                <div className="svc-card__foot"><span className="svc-card__price">$195</span><span className="svc-card__add">Add +</span></div>
              </div>
            </article>

            <article className="svc-card" data-svc="Sales Standard (3–4 bed)" data-price="295" data-desc="3–4 bed sales shoot — 20 HDR photos, full retouching, sky replacement, next-business-day delivery, agent-facing licensing." data-img="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&q=80">
              <div className="svc-card__media"><div className="svc-card__media__img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&q=80')" }}></div></div>
              <span className="svc-card__badge">In booking</span>
              <div className="svc-card__body">
                <h4 className="svc-card__name">Sales Standard</h4>
                <p className="svc-card__desc">3–4 bed · 20 HDR photos · full retouching · sky replacement.</p>
                <div className="svc-card__foot"><span className="svc-card__price">$295</span><span className="svc-card__add">Add +</span></div>
              </div>
            </article>

            <article className="svc-card" data-svc="Sales Premium (5+ bed)" data-price="395" data-desc="5+ bed sales shoot — 25 HDR photos, full retouching, sky replacement, next-business-day delivery, agent-facing licensing." data-img="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80">
              <div className="svc-card__media"><div className="svc-card__media__img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80')" }}></div></div>
              <span className="svc-card__badge">In booking</span>
              <div className="svc-card__body">
                <h4 className="svc-card__name">Sales Premium</h4>
                <p className="svc-card__desc">5+ bed · 25 HDR photos · full retouching · sky replacement.</p>
                <div className="svc-card__foot"><span className="svc-card__price">$395</span><span className="svc-card__add">Add +</span></div>
              </div>
            </article>

          </div>
        </div>

        {/* DRONE */}
        <div className="cat" id="cat-drone" data-gallery="drone">
          <div className="cat__head"><h3>Aerial <em>/ drone</em></h3><span className="cat__count">CASA-licensed</span></div>
          <div className="svc-grid">

            <article className="svc-card" data-svc="Drone Set (5 images)" data-price="220" data-desc="CASA-compliant drone set — 5 edited stills: 2 aesthetic hero shots, 2 POI shots, 1 plot/land overview." data-img="https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=900&q=80">
              <div className="svc-card__media"><div className="svc-card__media__img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=900&q=80')" }}></div></div>
              <span className="svc-card__badge">In booking</span>
              <div className="svc-card__body">
                <h4 className="svc-card__name">Drone Set</h4>
                <p className="svc-card__desc">5 edited images — 2 hero, 2 POI, 1 plot overview. CASA RePL pilot.</p>
                <div className="svc-card__foot"><span className="svc-card__price">$220</span><span className="svc-card__add">Add +</span></div>
              </div>
            </article>

            <article className="svc-card" data-svc="Additional Drone Image" data-price="25" data-desc="Each drone image beyond the standard 5-image set." data-img="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&q=80">
              <div className="svc-card__media"><div className="svc-card__media__img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&q=80')" }}></div></div>
              <span className="svc-card__badge">In booking</span>
              <div className="svc-card__body">
                <h4 className="svc-card__name">Additional Drone Image</h4>
                <p className="svc-card__desc">Each image beyond the standard 5-image set.</p>
                <div className="svc-card__foot"><span className="svc-card__price">$25 <small>/ img</small></span><span className="svc-card__add">Add +</span></div>
              </div>
            </article>

          </div>
        </div>

        {/* VIDEO */}
        <div className="cat" id="cat-video" data-gallery="video">
          <div className="cat__head"><h3>Video</h3><span className="cat__count">4 products</span></div>
          <p style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--graphite)', maxWidth: 640, marginBottom: 18 }}>
            Listing Video length scales with property size: 40s (1–2 bed), 50s (3–4 bed), 60s (5+ bed). Optional +30s extended cut on any video for $100.
          </p>
          <div className="svc-grid">

            <article className="svc-card" data-svc="Social Reel (30s · 9:16)" data-price="195" data-desc="30-second vertical reel cut for Instagram and TikTok with music and captions." data-img="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&q=80">
              <div className="svc-card__media"><div className="svc-card__media__img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&q=80')" }}></div></div>
              <span className="svc-card__badge">In booking</span>
              <div className="svc-card__body">
                <h4 className="svc-card__name">Social Reel</h4>
                <p className="svc-card__desc">30s portrait 9:16 cut for Instagram and TikTok.</p>
                <div className="svc-card__foot"><span className="svc-card__price">$195</span><span className="svc-card__add">Add +</span></div>
              </div>
            </article>

            <article className="svc-card" data-svc="Listing Video (40–60s · 16:9)" data-price="395" data-desc="Landscape 16:9 listing video, length scales with property size. Music-bedded, gimbal walkthrough plus exterior." data-img="https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?w=900&q=80">
              <div className="svc-card__media"><div className="svc-card__media__img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?w=900&q=80')" }}></div></div>
              <span className="svc-card__badge">In booking</span>
              <div className="svc-card__body">
                <h4 className="svc-card__name">Listing Video</h4>
                <p className="svc-card__desc">40–60s landscape — covers most agent listing needs.</p>
                <div className="svc-card__foot"><span className="svc-card__price">$395</span><span className="svc-card__add">Add +</span></div>
              </div>
            </article>

            <article className="svc-card" data-svc="Premium Cinematic (90s · 16:9)" data-price="595" data-desc="90-second cinematic listing video for luxury homes — drone B-roll integrated, full musical score." data-img="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80">
              <div className="svc-card__media"><div className="svc-card__media__img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80')" }}></div></div>
              <span className="svc-card__badge">In booking</span>
              <div className="svc-card__body">
                <h4 className="svc-card__name">Premium Cinematic</h4>
                <p className="svc-card__desc">90s landscape · drone B-roll integrated · luxury homes.</p>
                <div className="svc-card__foot"><span className="svc-card__price">$595</span><span className="svc-card__add">Add +</span></div>
              </div>
            </article>

            <article className="svc-card" data-svc="Walk-through Video (2–3 min)" data-price="295" data-desc="Handheld stabilised room-by-room walk-through, 2–3 minutes — the buyer-facing remote inspection format." data-img="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=80">
              <div className="svc-card__media"><div className="svc-card__media__img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=80')" }}></div></div>
              <span className="svc-card__badge">In booking</span>
              <div className="svc-card__body">
                <h4 className="svc-card__name">Walk-through</h4>
                <p className="svc-card__desc">2–3 min handheld · buyer-facing remote inspection format.</p>
                <div className="svc-card__foot"><span className="svc-card__price">$295</span><span className="svc-card__add">Add +</span></div>
              </div>
            </article>

          </div>
        </div>

        {/* VIRTUAL EDITING — info only, handled in Vision Studio client portal */}
        <div className="cat" id="cat-staging" data-gallery="staging">
          <div className="cat__head"><h3>Virtual <em>editing</em></h3><span className="cat__count">Vision Studio · post-shoot</span></div>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--graphite)', maxWidth: 720, marginBottom: 8 }}>
            Virtual staging, decluttering, day-to-dusk, sky replacement, grass enhancement and object removal are <strong>not booked here</strong>. Once the shoot is delivered, you'll review the gallery in the <strong>Vision Studio client portal</strong> and pick which photos need editing — pay only for what you choose. Volume rates apply automatically.
          </p>

          {/* Before/after comparison sliders — placeholder Unsplash imagery, swap with real shots later */}
          <div className="ba-row" style={{ marginTop: 16 }}>
            <BeforeAfterSlider
              label="Decluttering"
              beforeAlt="Cluttered living room (placeholder)"
              afterAlt="Decluttered living room (placeholder)"
              beforeSrc="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1200&q=80"
              afterSrc="https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=80"
            />
            <BeforeAfterSlider
              label="Virtual Staging"
              beforeAlt="Empty room (placeholder)"
              afterAlt="Virtually staged room (placeholder)"
              beforeSrc="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80"
              afterSrc="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80"
            />
            <BeforeAfterSlider
              label="Day to Dusk"
              beforeAlt="Exterior at day (placeholder)"
              afterAlt="Exterior at dusk (placeholder)"
              beforeSrc="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80"
              afterSrc="https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80"
            />
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
                  <span className="fp-foot__label">Subtotal · ex-GST</span>
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
          <div className="cat__head"><h3>Add-ons</h3><span className="cat__count">À la carte</span></div>
          <p style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--graphite)', maxWidth: 640, marginBottom: 18 }}>
            Standard delivery is next business day for photos, 2 business days for video. Distance surcharge of $20 per 5km block applies automatically to properties beyond 20km from Melbourne CBD.
          </p>
          <div className="svc-grid">

            <article className="svc-card" data-svc="Additional Photos" data-price="25" data-desc="Each photo delivered above the standard tier count." data-img="https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?w=900&q=80">
              <div className="svc-card__media"><div className="svc-card__media__img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?w=900&q=80')" }}></div></div>
              <span className="svc-card__badge">In booking</span>
              <div className="svc-card__body">
                <h4 className="svc-card__name">Additional Photos</h4>
                <p className="svc-card__desc">Each photo above the standard tier count.</p>
                <div className="svc-card__foot"><span className="svc-card__price">$25 <small>/ img</small></span><span className="svc-card__add">Add +</span></div>
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
              <p>A Melbourne property media studio. Photography, video, drone, floor plans, virtual staging. Same day turn around.</p>
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
      if(priceEl) priceEl.textContent = p === 0 ? 'POA' : '$' + Number(p).toLocaleString('en-AU');
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

  // Package picker — Showcase / Signature / Cinematic
  (function(){
    const fmtAud = (n) => '$' + Number(n).toLocaleString('en-AU');
    const cards = document.querySelectorAll('.pkg-card');
    const state = new Map(); // pkgKey -> tierKey

    cards.forEach(card => {
      const pkgKey = card.dataset.pkg;
      const pkgName = card.dataset.pkgName;
      const pkgImg = card.dataset.pkgImg;
      let tiers;
      try { tiers = JSON.parse(card.dataset.tiers || '{}'); } catch (_) { tiers = {}; }
      state.set(pkgKey, 'compact');

      const priceEl = card.querySelector('[data-pkg-price]');
      const listEl  = card.querySelector('[data-pkg-list]');
      const addBtn  = card.querySelector('[data-pkg-add]');
      const pillBtns = card.querySelectorAll('[data-pkg-tiers] button');

      function currentName(){
        const t = state.get(pkgKey);
        return pkgName + ' — ' + tiers[t].label;
      }

      function refresh(){
        const t = state.get(pkgKey);
        const tier = tiers[t];
        if(priceEl) priceEl.textContent = fmtAud(tier.promo);
        if(listEl)  listEl.textContent  = fmtAud(tier.price);

        // Reflect cart state: highlight card if any tier of this package is in cart
        const inCart = Array.from(items.keys()).some(k => k.startsWith(pkgName + ' — '));
        card.classList.toggle('is-added', inCart);
      }

      pillBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          pillBtns.forEach(b => b.classList.remove('is-active'));
          btn.classList.add('is-active');
          state.set(pkgKey, btn.dataset.tier);
          refresh();
        });
      });

      if(addBtn){
        addBtn.addEventListener('click', () => {
          // Remove any other tier of this package, then add the chosen tier
          Array.from(items.keys()).forEach(k => {
            if(k.startsWith(pkgName + ' — ')) items.delete(k);
          });
          const t = state.get(pkgKey);
          const tier = tiers[t];
          items.set(currentName(), { price: String(tier.price), img: pkgImg });
          render();
          openCart();
          refresh();
        });
      }

      refresh();
    });

    // Deep-link: /book?package=showcase|signature|cinematic
    try {
      const params = new URLSearchParams(window.location.search);
      const wanted = (params.get('package') || '').toLowerCase();
      if(wanted){
        const target = document.querySelector('.pkg-card[data-pkg="' + wanted + '"]');
        if(target){
          target.classList.add('is-target');
          setTimeout(() => target.scrollIntoView({ behavior:'smooth', block:'start' }), 200);
          setTimeout(() => target.classList.remove('is-target'), 3000);
        }
      }
    } catch (_) {}
  })();

  render();
})();
`}</Script>
      <ServiceGalleryLightbox />
    </>
  );
}
