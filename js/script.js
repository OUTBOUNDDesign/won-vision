/* WON MEDIA — site script
   Hero aperture · nav scroll · scroll reveals · gallery filters + lightbox
*/

document.addEventListener('DOMContentLoaded', () => {

  // ---------- LOADER: minimal manual gate (once per session) ----------
  (function(){
    const loader = document.getElementById('loader');
    if(!loader) return;

    // Already entered this session — drop the loader, don't lock the page
    if (sessionStorage.getItem('wv-entered') === '1') {
      loader.remove();
      document.body.classList.remove('is-loading');
      return;
    }

    const btn = document.getElementById('enterBtn');
    if(!btn) return;

    document.body.classList.add('is-loading');

    // Background-preload key images so they're cached when the user clicks Enter.
    [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1800&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1800&q=80',
    ].forEach(src => { const i = new Image(); i.src = src; });

    function enter(){
      sessionStorage.setItem('wv-entered', '1');
      loader.classList.add('is-out');
      document.body.classList.remove('is-loading');
      setTimeout(() => loader.remove(), 1150);
    }
    btn.addEventListener('click', enter);
    btn.addEventListener('keydown', (e) => {
      if(e.key === 'Enter' || e.key === ' ') enter();
    });
  })();

  // ---------- Hero copy: reveal once fonts are loaded (kills FOUT snap) ----------
  (function(){
    const copy = document.querySelectorAll('.hero__copy');
    if(!copy.length) return;
    function ready(){ copy.forEach(el => el.classList.add('fonts-ready')); }
    if(document.fonts && document.fonts.ready){
      document.fonts.ready.then(ready);
    } else {
      // Fallback if Font Loading API is unavailable
      window.addEventListener('load', ready);
    }
  })();


  // ---------- NAV: scroll lock + light/dark + hide on scroll-down ----------
  (function(){
    const nav = document.querySelector('.nav');
    if(!nav) return;
    const heroHero = document.querySelector('.hero, .gallery-hero');
    const isLightOverride = nav.dataset.startLight === 'true';

    const filterBar = document.querySelector('.gallery-controls');
    let lastY = window.scrollY;
    const hideThreshold = 120;
    const deltaThreshold = 6;

    function setHidden(state){
      nav.classList.toggle('is-hidden', state);
      if(filterBar) filterBar.classList.toggle('is-hidden', state);
    }

    function update(){
      const y = window.scrollY;
      const delta = y - lastY;

      nav.classList.toggle('is-stuck', y > 24);

      if(heroHero){
        const r = heroHero.getBoundingClientRect();
        const overHero = r.bottom > 80;
        nav.classList.toggle('is-light', overHero && isLightOverride);
      }

      if(Math.abs(delta) > deltaThreshold){
        if(delta > 0 && y > hideThreshold){
          setHidden(true);
        } else if(delta < 0){
          setHidden(false);
        }
        lastY = y;
      }
      if(y <= hideThreshold) setHidden(false);
    }
    window.addEventListener('scroll', update, {passive:true});
    update();
  })();

  // ---------- NAV brand: scroll-to-top on home ----------
  (function(){
    document.querySelectorAll('a[data-home]').forEach(a => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href') || '';
        // If we're already on the homepage, just scroll to top
        const path = location.pathname.split('/').pop();
        const isHome = path === '' || path === 'index.html';
        if(isHome && href.startsWith('#')){
          e.preventDefault();
          window.scrollTo({top: 0, behavior: 'smooth'});
          // Also clear any focus to make it feel like a true reset
          if(document.activeElement && document.activeElement.blur) document.activeElement.blur();
        }
      });
    });
  })();

  // ---------- NAV: mobile drawer ----------
  (function(){
    const burger = document.querySelector('.nav__burger');
    const nav = document.querySelector('.nav');
    if(!burger || !nav) return;
    burger.addEventListener('click', () => {
      nav.classList.toggle('is-open');
      document.body.style.overflow = nav.classList.contains('is-open') ? 'hidden' : '';
    });
    document.querySelectorAll('.nav__drawer a').forEach(a => {
      a.addEventListener('click', () => {
        nav.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
  })();

  // ---------- Pause hero animation when off-screen ----------
  (function(){
    const base = document.querySelector('.hero__base');
    if(!base) return;
    const heroSec = document.querySelector('.hero');
    if(!heroSec) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        base.style.animationPlayState = e.isIntersecting ? 'running' : 'paused';
      });
    }, { threshold: 0.05 });
    io.observe(heroSec);
  })();

  // ---------- HERO aperture (desktop) / parallax (mobile) + small cursor ----------
  (function(){
    const hero = document.querySelector('.hero');
    const lens = hero && hero.querySelector('.hero__lens');
    const base = hero && hero.querySelector('.hero__base');

    let cur = document.querySelector('.hero__cursor');
    if(!cur){
      cur = document.createElement('div');
      cur.className = 'hero__cursor';
      document.body.appendChild(cur);
    }

    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    // ===== Mobile: scroll + device-tilt parallax (no aperture, no scroll-block) =====
    if (isMobile) {
      if (!hero || !base) return;
      // Disable Ken Burns; we'll drive the transform manually
      base.style.animation = 'none';
      if (lens) lens.style.animation = 'none';

      let scrollPx = 0, tiltX = 0, tiltY = 0, raf = null;
      function paint(){
        const tx = tiltX;
        const ty = scrollPx * 0.3 + tiltY;
        base.style.transform = `scale(1.12) translate3d(${tx}px, ${ty}px, 0)`;
        if (lens) lens.style.transform = `scale(1.06) translate3d(${tx * 1.4}px, ${ty * 0.7}px, 0)`;
        raf = null;
      }
      function schedule(){ if(!raf) raf = requestAnimationFrame(paint); }

      window.addEventListener('scroll', () => {
        scrollPx = Math.min(window.scrollY, window.innerHeight * 1.2);
        schedule();
      }, { passive: true });

      function onTilt(e){
        // gamma: -90 → 90 (left/right). beta: -180 → 180 (front/back).
        const gx = e.gamma || 0;
        const by = (e.beta || 0) - 45; // assume phone held ~45° tilt forward
        tiltX = Math.max(-18, Math.min(18, gx * 0.35));
        tiltY = Math.max(-12, Math.min(12, by * 0.25));
        schedule();
      }
      // iOS 13+ requires a user-gesture-triggered permission request
      if (typeof DeviceOrientationEvent !== 'undefined'
          && typeof DeviceOrientationEvent.requestPermission === 'function') {
        const ask = () => {
          DeviceOrientationEvent.requestPermission().then(p => {
            if (p === 'granted') window.addEventListener('deviceorientation', onTilt);
          }).catch(() => {});
        };
        document.body.addEventListener('touchstart', ask, { once: true, passive: true });
      } else if ('DeviceOrientationEvent' in window) {
        window.addEventListener('deviceorientation', onTilt);
      }

      paint();
      return;
    }

    // ===== Desktop: aperture cursor lens + global small-circle cursor =====
    if (lens) {
      lens.style.setProperty('--mx', '50%');
      lens.style.setProperty('--my', '55%');
    }

    let raf = null, mx = 50, my = 55, cx = 0, cy = 0;
    function paint(){
      if(lens){
        lens.style.setProperty('--mx', mx + '%');
        lens.style.setProperty('--my', my + '%');
      }
      cur.style.left = cx + 'px';
      cur.style.top = cy + 'px';
      raf = null;
    }

    window.addEventListener('mousemove', (e) => {
      cx = e.clientX; cy = e.clientY;
      cur.style.opacity = 1;
      if(hero && lens){
        const r = hero.getBoundingClientRect();
        const overHero = e.clientY >= r.top && e.clientY <= r.bottom;
        cur.classList.toggle('over-hero', overHero);
        if(overHero){
          mx = ((e.clientX - r.left) / r.width) * 100;
          my = ((e.clientY - r.top) / r.height) * 100;
        }
      } else {
        cur.classList.remove('over-hero');
      }
      if(!raf) raf = requestAnimationFrame(paint);
    }, {passive:true});

    document.addEventListener('mouseout', (e) => {
      if(!e.relatedTarget && !e.toElement) cur.style.opacity = 0;
    });

    if(hero){
      hero.addEventListener('mouseleave', () => {
        if(!lens) return;
        mx = 50; my = 55;
        lens.style.setProperty('--mx', '50%');
        lens.style.setProperty('--my', '55%');
      });
    }
  })();

  // ---------- PROCESS: accordion + count-up numbers ----------
  (function(){
    const items = document.querySelectorAll('.process__item');
    if(!items.length) return;

    // Accordion (one open at a time) — click anywhere on the card toggles it
    items.forEach(it => {
      it.addEventListener('click', () => {
        const isOpen = it.classList.contains('is-open');
        items.forEach(s => {
          s.classList.remove('is-open');
          const r = s.querySelector('.process__row');
          if(r) r.setAttribute('aria-expanded', 'false');
        });
        if(!isOpen){
          it.classList.add('is-open');
          const r = it.querySelector('.process__row');
          if(r) r.setAttribute('aria-expanded', 'true');
        }
      });
    });

    // Count-up — animates each number to its target when scrolled into view
    const nums = document.querySelectorAll('.process__num[data-count]');
    if(!nums.length) return;
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);
    function animate(el, target){
      const dur = 900;
      const start = performance.now();
      function tick(now){
        const t = Math.min(1, (now - start) / dur);
        const v = Math.floor(target * easeOut(t));
        el.textContent = String(v).padStart(2, '0');
        if(t < 1) requestAnimationFrame(tick);
        else el.textContent = String(target).padStart(2, '0');
      }
      requestAnimationFrame(tick);
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if(e.isIntersecting){
          const target = parseInt(e.target.dataset.count, 10);
          animate(e.target, target);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    nums.forEach(el => io.observe(el));
  })();

  // ---------- SCROLL REVEALS ----------
  (function(){
    const els = document.querySelectorAll('.reveal, .reveal-stagger');
    if(!els.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(el => io.observe(el));
  })();

  // ---------- GALLERY: filters ----------
  (function(){
    const filters = document.querySelectorAll('.filter');
    const items = document.querySelectorAll('.gallery__item');
    const counter = document.querySelector('[data-gallery-count]');
    if(!filters.length || !items.length) return;

    function apply(tag){
      let n = 0;
      items.forEach(it => {
        const tags = (it.dataset.tags || '').split(' ');
        const show = tag === 'all' || tags.includes(tag);
        it.classList.toggle('is-hidden', !show);
        if(show) n++;
      });
      if(counter) counter.textContent = String(n).padStart(2,'0');
    }
    filters.forEach(f => {
      f.addEventListener('click', () => {
        filters.forEach(x => x.classList.remove('is-active'));
        f.classList.add('is-active');
        apply(f.dataset.filter);
      });
    });
  })();

  // ---------- GALLERY: lightbox ----------
  (function(){
    const items = document.querySelectorAll('.gallery__item');
    if(!items.length) return;

    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.innerHTML = `
      <button class="lightbox__close" aria-label="Close">×</button>
      <button class="lightbox__nav prev" aria-label="Previous">← Prev</button>
      <div class="lightbox__media"><img src="" alt=""></div>
      <button class="lightbox__nav next" aria-label="Next">Next →</button>
      <div class="lightbox__caption"><b></b><span></span></div>
    `;
    document.body.appendChild(lb);
    const lbImg = lb.querySelector('img');
    const lbPlace = lb.querySelector('.lightbox__caption b');
    const lbTags = lb.querySelector('.lightbox__caption span');
    const closeBtn = lb.querySelector('.lightbox__close');
    const prevBtn = lb.querySelector('.lightbox__nav.prev');
    const nextBtn = lb.querySelector('.lightbox__nav.next');

    let current = 0;
    const list = Array.from(items);

    function open(i){
      current = i;
      const it = list[i];
      const img = it.querySelector('img');
      const big = it.dataset.full || img.src;
      lbImg.src = big;
      lbImg.alt = img.alt || '';
      lbPlace.textContent = it.dataset.place || '';
      lbTags.textContent = (it.dataset.tags || '').split(' ').join(' · ');
      lb.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
    function close(){
      lb.classList.remove('is-open');
      document.body.style.overflow = '';
    }
    function step(d){
      let visible = list.filter(it => !it.classList.contains('is-hidden'));
      if(!visible.length) return;
      const idxInVisible = visible.indexOf(list[current]);
      const next = (idxInVisible + d + visible.length) % visible.length;
      open(list.indexOf(visible[next]));
    }

    items.forEach((it, i) => it.addEventListener('click', () => open(i)));
    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', () => step(-1));
    nextBtn.addEventListener('click', () => step(1));
    lb.addEventListener('click', (e) => { if(e.target === lb) close(); });
    document.addEventListener('keydown', (e) => {
      if(!lb.classList.contains('is-open')) return;
      if(e.key === 'Escape') close();
      if(e.key === 'ArrowLeft') step(-1);
      if(e.key === 'ArrowRight') step(1);
    });
  })();

  // ---------- GALLERY: stagger reveal ----------
  (function(){
    const items = document.querySelectorAll('.gallery__item');
    if(!items.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if(e.isIntersecting){
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    items.forEach((it, i) => {
      it.style.transitionDelay = (i % 6) * 0.05 + 's';
      io.observe(it);
    });
  })();

});
