import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { Wordmark } from '../../components/Wordmark';

export const metadata: Metadata = {
  title: 'Checkout',
  description:
    'Confirm your property and contact details for your Won Vision real estate shoot booking.',
};

export default function CheckoutPage() {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <style>{`
  .step-form .row.has-error label{color:#c4543a}
  .step-form .row.has-error input,
  .step-form .row.has-error textarea,
  .step-form .row.has-error select{
    border-color:#c4543a;
    background:rgba(196,84,58,0.04);
  }
  .form-errors{
    background:rgba(196,84,58,0.08);
    border:1px solid rgba(196,84,58,0.4);
    color:#a23f28;
    padding:14px 18px;
    margin-bottom:24px;
    font-family:var(--body);
  }
  .form-errors strong{
    display:block;font-family:var(--display);font-weight:500;
    font-size:16px;color:#a23f28;margin-bottom:6px;letter-spacing:-0.005em;
  }
  .form-errors ul{
    list-style:none;margin:0;padding:0;
    font-size:13px;line-height:1.7;
  }
  .form-errors li::before{content:'\\2014 ';color:#c4543a}
  .form-errors[hidden]{display:none}

  .step-form .hint{
    display:block;margin-top:6px;
    font-family:var(--body);font-size:11px;line-height:1.5;color:var(--graphite);
    letter-spacing:0.01em;
  }
  .address-wrap{position:relative;margin-bottom:18px}
  .address-input-wrap{position:relative}
  .address-suggest{
    position:absolute;left:0;right:0;top:100%;z-index:20;
    background:var(--paper);
    border:1px solid rgba(74,74,72,0.22);
    box-shadow:0 8px 20px rgba(10,10,10,0.06);
    max-height:280px;overflow-y:auto;
    display:none;margin-top:-1px;
  }
  .address-suggest.is-open{display:block}
  .address-suggest__item{
    padding:10px 14px;cursor:pointer;
    font-family:var(--body);font-size:13px;line-height:1.4;color:var(--graphite);
    border-bottom:1px solid rgba(74,74,72,0.1);
    display:flex;flex-direction:column;gap:2px;
  }
  .address-suggest__item:last-child{border-bottom:none}
  .address-suggest__item:hover, .address-suggest__item.is-active{background:var(--soft);color:var(--ink)}
  .address-suggest__item strong{font-family:var(--display);font-weight:500;font-size:14px;color:var(--ink);letter-spacing:-0.005em}
  .address-suggest__loading{padding:12px 14px;font-size:12px;color:var(--graphite)}

  .prop-map{
    position:relative;
    height:260px;
    background:var(--soft);
    border:1px solid rgba(74,74,72,0.16);
    margin-bottom:24px;
    overflow:hidden;
    opacity:0;transform:translateY(6px);
    transition:opacity .45s var(--ease), transform .45s var(--ease);
  }
  .prop-map.is-active{opacity:1;transform:none}
  .prop-map__canvas{
    position:absolute;inset:0;
    background:var(--soft);
    filter:grayscale(1) contrast(1.05) brightness(0.97) sepia(0.04) hue-rotate(180deg) saturate(0.4);
  }
  .prop-map .leaflet-container{background:var(--soft) !important;outline:none !important}
  .prop-map .leaflet-control-attribution,
  .prop-map .leaflet-control-zoom,
  .prop-map .leaflet-control-container{display:none !important}
  .prop-map__label{
    position:absolute;top:14px;left:14px;z-index:5;
    background:var(--paper);padding:8px 12px;
    font-family:var(--body);font-size:10px;letter-spacing:0.22em;text-transform:uppercase;
    color:var(--ink);font-weight:600;
    border:1px solid rgba(74,74,72,0.15);
  }
  .map-pulse{transform-origin:center;animation:mapPulseDot 2.4s ease-in-out infinite}
  @keyframes mapPulseDot{
    0%,100%{stroke-opacity:0.55;fill-opacity:0.18;transform:scale(1)}
    50%{stroke-opacity:0.2;fill-opacity:0.05;transform:scale(1.5)}
  }

  @media (max-width:760px){
    .prop-map{height:200px;margin-bottom:18px}
    .prop-map__label{font-size:9px;padding:6px 10px;letter-spacing:0.18em;top:10px;left:10px}
    .address-suggest{max-height:240px}
    .address-suggest__item{padding:9px 12px;font-size:12px}
    .address-suggest__item strong{font-size:13px}
  }
  @media (max-width:560px){
    .prop-map{height:180px}
    .form-errors{padding:12px 14px}
    .form-errors strong{font-size:14px}
    .form-errors ul{font-size:12px}
  }
`}</style>

      <header className="nav is-stuck">
        <div className="nav__brand">
          <Link href="/#top" data-home aria-label="Won Vision — home"><Wordmark /></Link>
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

      <section className="step-page">
        <div className="progress">
          <div className="progress__step is-done"><span className="progress__num">1</span><span>Cart</span></div>
          <span className="progress__line is-done"></span>
          <div className="progress__step is-active"><span className="progress__num">2</span><span>Details</span></div>
          <span className="progress__line"></span>
          <div className="progress__step"><span className="progress__num">3</span><span>Schedule</span></div>
          <span className="progress__line"></span>
          <div className="progress__step"><span className="progress__num">4</span><span>Confirm</span></div>
        </div>

        <div className="step-inner">
          <form className="step-form" id="checkoutForm" noValidate>
            <h2>Property &amp; <em>your details.</em></h2>
            <p className="lede">Address for the shoot, plus the contact we'll send the call sheet to.</p>

            <section>
              <h3>Property details</h3>
              <div className="row address-wrap">
                <label htmlFor="address">Street address</label>
                <div className="address-input-wrap">
                  <input id="address" name="address" type="text" placeholder="Start typing the address" required
                         autoComplete="street-address" aria-autocomplete="list" aria-controls="addrSuggest" />
                  <div className="address-suggest" id="addrSuggest" role="listbox"></div>
                </div>
                <small className="hint">We'll auto-fill the suburb, state and postcode from your selection.</small>
              </div>
              <div className="row two">
                <div><label htmlFor="unit">Unit / apt (optional)</label><input id="unit" name="unit" type="text" autoComplete="address-line2" /></div>
                <div><label htmlFor="suburb">Suburb</label><input id="suburb" name="suburb" type="text" placeholder="Suburb" required autoComplete="address-level2" /></div>
              </div>
              <div className="row three">
                <div><label htmlFor="state">State</label>
                  <select id="state" name="state" required autoComplete="address-level1" defaultValue="VIC">
                    <option value="VIC">VIC</option>
                    <option>NSW</option><option>QLD</option><option>SA</option>
                    <option>WA</option><option>TAS</option><option>NT</option><option>ACT</option>
                  </select>
                </div>
                <div><label htmlFor="postcode">Postcode</label><input id="postcode" name="postcode" type="text" placeholder="0000" required autoComplete="postal-code" /></div>
                <div><label htmlFor="country">Country</label><input id="country" name="country" type="text" defaultValue="Australia" readOnly autoComplete="country-name" /></div>
              </div>
              <div className="row"><label htmlFor="propertyNotes">Property notes (optional)</label><textarea id="propertyNotes" name="propertyNotes" rows={2} placeholder="Anything about access, parking, light, layout."></textarea></div>

              <div className="prop-map" id="propMap" hidden>
                <div className="prop-map__canvas" id="propMapCanvas" aria-label="Property location map"></div>
                <div className="prop-map__label" id="propMapLabel">Property location</div>
              </div>
            </section>

            <section>
              <h3>Your details</h3>
              <div className="row two">
                <div><label htmlFor="firstName">First name</label><input id="firstName" name="firstName" type="text" required autoComplete="given-name" /></div>
                <div><label htmlFor="lastName">Last name</label><input id="lastName" name="lastName" type="text" required autoComplete="family-name" /></div>
              </div>
              <div className="row two">
                <div><label htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="email" /></div>
                <div><label htmlFor="phone">Phone</label><input id="phone" name="phone" type="tel" required autoComplete="tel" /></div>
              </div>
              <div className="row" style={{ position: 'relative' }}>
                <label htmlFor="agency">Agency</label>
                <input id="agency" name="agency" type="text" placeholder="Studio or agency name (e.g. Acme Realty)"
                       autoComplete="off" autoCorrect="off" spellCheck="false" />
                <ul id="agencyTypeahead"
                    role="listbox"
                    style={{ position: 'absolute', left: 0, right: 0, top: 'calc(100% + 4px)', zIndex: 30,
                             listStyle: 'none', margin: 0, padding: 0, background: '#fff', border: '1px solid rgba(0,0,0,.18)',
                             borderRadius: 6, boxShadow: '0 6px 18px rgba(0,0,0,.08)', maxHeight: 240, overflow: 'auto',
                             display: 'none' }}></ul>
                <small className="hint">Existing brands appear as you type — pick one or type a new agency.</small>
              </div>
              <div className="row" style={{ position: 'relative' }}>
                <label htmlFor="agencyOffice">Agency office location</label>
                <input id="agencyOffice" name="agencyOffice" type="text" placeholder="Office address or suburb (e.g. Acme Realty Northside)"
                       autoComplete="off" autoCorrect="off" spellCheck="false" />
                <ul id="officeTypeahead"
                    role="listbox"
                    style={{ position: 'absolute', left: 0, right: 0, top: 'calc(100% + 4px)', zIndex: 30,
                             listStyle: 'none', margin: 0, padding: 0, background: '#fff', border: '1px solid rgba(0,0,0,.18)',
                             borderRadius: 6, boxShadow: '0 6px 18px rgba(0,0,0,.08)', maxHeight: 240, overflow: 'auto',
                             display: 'none' }}></ul>
                <small className="hint">Pick the specific office. Two agents from the same brand at different offices stay distinct.</small>
              </div>
            </section>

            <div className="form-errors" id="formErrors" hidden role="alert" aria-live="polite">
              <strong>A few things still missing</strong>
              <ul id="formErrorsList"></ul>
            </div>

            <div className="step-actions">
              <Link href="/book" className="step-back">← Back to cart</Link>
              <button type="submit" className="step-submit">Continue to schedule →</button>
            </div>
          </form>

          <aside className="step-summary">
            <h3>Your booking</h3>
            <div className="step-summary__list" id="summaryList"></div>
            <div className="step-summary__total">
              <span className="step-summary__total__label">Subtotal · GST inc.</span>
              <span className="step-summary__total__amt" id="summaryAmt">$0</span>
            </div>
            <Link href="/book" className="step-summary__edit">← Edit cart</Link>
          </aside>
        </div>
      </section>

      <footer className="foot">
        <div className="foot__inner">
          <div className="foot__top">
            <div>
              <Link href="/#top" data-home aria-label="Won Vision — home"><Wordmark /></Link>
              <p>A Melbourne property media studio. Photography, video, drone, floor plans, virtual staging. Your listing the star, we make it go far.</p>
            </div>
            <div><h4>Studio</h4><ul>
              <li><Link href="/#services">Services</Link></li>
              <li><Link href="/gallery">Gallery</Link></li>
              <li><Link href="/book">Book now</Link></li>
            </ul></div>
            <div><h4>Contact</h4><ul>
              <li><a href="mailto:studio@wonvision.com.au">studio@wonvision.com.au</a></li>
              <li><a href="tel:+61000000000">+61 (0) 0000 0000</a></li>
            </ul></div>
            <div><h4>Operations</h4><ul>
              <li>Won Vision Pty Ltd</li>
              <li>CASA-licensed drone ops</li>
            </ul></div>
          </div>
          <div className="foot__rule"></div>
          <div className="foot__bot">
            <span>© 2026 Won Vision Pty Ltd</span>
            <span>Your listing the star, we make it go far.</span>
            <span>Melbourne · Made in-house</span>
          </div>
        </div>
      </footer>

      <Script
        src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
        crossOrigin=""
        strategy="afterInteractive"
      />
      <Script id="wv-checkout" strategy="afterInteractive">{`
(function(){
  function boot(){
  const cart = JSON.parse(sessionStorage.getItem('wv-cart') || '[]');
  if (!cart.length) { window.location.href = '/book'; return; }

  const list = document.getElementById('summaryList');
  let total = 0;
  cart.forEach(it => {
    total += Number(it.price) || 0;
    const row = document.createElement('div');
    row.className = 'step-summary__item';
    const priceLabel = (Number(it.price) === 0) ? 'POA' : '$' + Number(it.price).toLocaleString('en-AU');
    row.innerHTML = \`
      <div class="step-summary__thumb" style="background-image:url('\${it.img}')"></div>
      <div class="step-summary__name">\${it.name}</div>
      <div class="step-summary__price">\${priceLabel}</div>\`;
    list.appendChild(row);
  });
  document.getElementById('summaryAmt').textContent = total === 0 ? '$0' : '$' + total.toLocaleString('en-AU');

  const prior = JSON.parse(sessionStorage.getItem('wv-details') || '{}');
  Object.entries(prior).forEach(([k,v]) => {
    const el = document.querySelector(\`[name="\${k}"]\`);
    if (el && typeof v === 'string') el.value = v;
  });
  if (prior.agencyLocation && typeof prior.agencyLocation === 'object'){
    window.WV_AGENCY_OFFICE = prior.agencyLocation;
  }

  const form = document.getElementById('checkoutForm');
  const errBox = document.getElementById('formErrors');
  const errList = document.getElementById('formErrorsList');

  const labelOf = (el) => {
    const row = el.closest('.row');
    if (row) {
      const lbl = row.querySelector('label');
      if (lbl) return lbl.textContent.replace(/\\(optional\\)/i,'').trim();
    }
    return el.name;
  };

  form.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input', () => clearFieldError(el));
    el.addEventListener('change', () => clearFieldError(el));
  });
  function clearFieldError(el){
    const row = el.closest('.row');
    if (row && row.classList.contains('has-error') && el.value.trim()){
      row.classList.remove('has-error');
      rebuildSummary();
    }
  }
  function rebuildSummary(){
    const stillBad = Array.from(form.querySelectorAll('.row.has-error label'))
      .map(l => l.textContent.trim());
    if (!stillBad.length){
      errBox.hidden = true;
      return;
    }
    errList.innerHTML = stillBad.map(t => \`<li>\${t}</li>\`).join('');
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const required = form.querySelectorAll('[required]');
    const missing = [];
    required.forEach(el => {
      const row = el.closest('.row');
      const filled = el.value.trim().length > 0;
      if (!filled){
        row && row.classList.add('has-error');
        missing.push(labelOf(el));
      } else {
        row && row.classList.remove('has-error');
      }
    });

    if (missing.length){
      errList.innerHTML = missing.map(t => \`<li>\${t}</li>\`).join('');
      errBox.hidden = false;
      const firstBad = form.querySelector('.row.has-error input, .row.has-error select, .row.has-error textarea');
      if (firstBad){
        const rect = firstBad.getBoundingClientRect();
        const offset = rect.top + window.scrollY - 110;
        window.scrollTo({top: offset, behavior: 'smooth'});
        setTimeout(() => firstBad.focus({preventScroll:true}), 400);
      }
      return;
    }

    const data = {};
    new FormData(form).forEach((v,k) => data[k] = v);
    if (window.WV_LATLON){
      data.lat = window.WV_LATLON.lat;
      data.lon = window.WV_LATLON.lon;
    }
    if (window.WV_AGENCY_OFFICE){
      data.agencyLocation = window.WV_AGENCY_OFFICE;
    }
    sessionStorage.setItem('wv-details', JSON.stringify(data));
    window.location.href = '/book/schedule';
  });

  // Agency typeahead
  (function(){
    const OPS_BASE = 'https://ops.outbounddesign.com.au';
    const TENANT_SLUG = 'won-vision';
    const input = document.getElementById('agency');
    const list = document.getElementById('agencyTypeahead');
    if (!input || !list) return;
    let activeReq = 0;
    function close(){ list.style.display = 'none'; list.innerHTML = ''; }
    function render(items){
      if (!items.length){ close(); return; }
      list.innerHTML = items.map(function(a){
        return '<li role="option" data-name="' + a.name.replace(/"/g,'&quot;') + '"' +
               ' style="padding:10px 12px;cursor:pointer;border-bottom:1px solid rgba(0,0,0,.06)">' +
               a.name + '</li>';
      }).join('');
      list.style.display = 'block';
      list.querySelectorAll('li').forEach(function(li){
        li.addEventListener('mousedown', function(ev){
          ev.preventDefault();
          input.value = li.dataset.name;
          close();
        });
        li.addEventListener('mouseenter', function(){ li.style.background = '#f3f3ee'; });
        li.addEventListener('mouseleave', function(){ li.style.background = ''; });
      });
    }
    let debounce;
    input.addEventListener('input', function(){
      clearTimeout(debounce);
      const q = input.value.trim();
      if (q.length < 2){ close(); return; }
      const reqId = ++activeReq;
      debounce = setTimeout(function(){
        fetch(OPS_BASE + '/api/public/' + TENANT_SLUG + '/agencies?q=' + encodeURIComponent(q),
              { credentials: 'omit' })
          .then(function(r){ return r.ok ? r.json() : { agencies: [] }; })
          .then(function(j){ if (reqId === activeReq) render(j.agencies || []); })
          .catch(function(){ if (reqId === activeReq) close(); });
      }, 200);
    });
    input.addEventListener('blur', function(){ setTimeout(close, 120); });
  })();

  // Office Places autocomplete
  (function(){
    const OPS_BASE = 'https://ops.outbounddesign.com.au';
    const TENANT_SLUG = 'won-vision';
    const input = document.getElementById('agencyOffice');
    const list = document.getElementById('officeTypeahead');
    if (!input || !list) return;
    window.WV_AGENCY_OFFICE = null;
    let activeReq = 0;
    function close(){ list.style.display = 'none'; list.innerHTML = ''; }
    function render(predictions){
      if (!predictions.length){ close(); return; }
      list.innerHTML = predictions.map(function(p){
        return '<li role="option" data-id="' + p.place_id + '" data-desc="' +
               p.description.replace(/"/g,'&quot;') + '"' +
               ' style="padding:10px 12px;cursor:pointer;border-bottom:1px solid rgba(0,0,0,.06)">' +
               p.description + '</li>';
      }).join('');
      list.style.display = 'block';
      list.querySelectorAll('li').forEach(function(li){
        li.addEventListener('mousedown', function(ev){
          ev.preventDefault();
          input.value = li.dataset.desc;
          fetch(OPS_BASE + '/api/public/' + TENANT_SLUG + '/places/details?place_id=' +
                encodeURIComponent(li.dataset.id), { credentials: 'omit' })
            .then(function(r){ return r.ok ? r.json() : null; })
            .then(function(j){
              if (!j) { window.WV_AGENCY_OFFICE = null; return; }
              window.WV_AGENCY_OFFICE = {
                place_id: j.place_id,
                label: j.name || '',
                address: j.formatted_address || '',
                suburb: j.suburb || '',
                state: j.state || '',
                postcode: j.postcode || '',
                country: j.country || 'Australia',
                lat: j.lat, lng: j.lng,
              };
            })
            .catch(function(){ window.WV_AGENCY_OFFICE = null; });
          close();
        });
        li.addEventListener('mouseenter', function(){ li.style.background = '#f3f3ee'; });
        li.addEventListener('mouseleave', function(){ li.style.background = ''; });
      });
    }
    let debounce;
    input.addEventListener('input', function(){
      clearTimeout(debounce);
      window.WV_AGENCY_OFFICE = null;
      const q = input.value.trim();
      if (q.length < 3){ close(); return; }
      const reqId = ++activeReq;
      debounce = setTimeout(function(){
        fetch(OPS_BASE + '/api/public/' + TENANT_SLUG +
              '/places/autocomplete?types=establishment&q=' + encodeURIComponent(q),
              { credentials: 'omit' })
          .then(function(r){ return r.ok ? r.json() : { predictions: [] }; })
          .then(function(j){ if (reqId === activeReq) render(j.predictions || []); })
          .catch(function(){ if (reqId === activeReq) close(); });
      }, 220);
    });
    input.addEventListener('blur', function(){ setTimeout(close, 120); });
  })();

  // Property map
  let _propMap = null, _propMarker = null;
  function renderPropMap(lat, lon, label){
    const wrap = document.getElementById('propMap');
    const canvas = document.getElementById('propMapCanvas');
    const lblEl = document.getElementById('propMapLabel');
    if(!wrap || !canvas || typeof L === 'undefined') return;
    wrap.hidden = false;
    requestAnimationFrame(() => wrap.classList.add('is-active'));
    if(lblEl && label) lblEl.textContent = label;

    if (!_propMap){
      _propMap = L.map(canvas, {
        attributionControl:false, zoomControl:false,
        scrollWheelZoom:false, doubleClickZoom:false, dragging:false,
        touchZoom:false, boxZoom:false, keyboard:false, tap:false,
      });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
        subdomains:'abcd', maxZoom:19, crossOrigin:true,
      }).addTo(_propMap);
    }
    const ll = [lat, lon];
    _propMap.setView(ll, 17);
    if(_propMarker) _propMarker.remove();
    _propMarker = L.circleMarker(ll, {
      radius:8, color:'#FAFAF7', weight:2,
      fillColor:'#4A6178', fillOpacity:1, interactive:false,
    }).addTo(_propMap);
    setTimeout(() => _propMap.invalidateSize(), 60);
  }

  (function(){
    const prior = JSON.parse(sessionStorage.getItem('wv-details') || '{}');
    if (prior.lat && prior.lon){
      const label = (prior.address ? prior.address + ', ' : '') + (prior.suburb || '');
      window.WV_LATLON = { lat: prior.lat, lon: prior.lon, label: label };
      renderPropMap(parseFloat(prior.lat), parseFloat(prior.lon), label);
    }
  })();

  // Address typeahead
  (function(){
    const input  = document.getElementById('address');
    const box    = document.getElementById('addrSuggest');
    const sub    = document.getElementById('suburb');
    const stEl   = document.getElementById('state');
    const post   = document.getElementById('postcode');
    if(!input || !box) return;

    const stateMap = {
      'Victoria':'VIC','New South Wales':'NSW','Queensland':'QLD',
      'South Australia':'SA','Western Australia':'WA','Tasmania':'TAS',
      'Northern Territory':'NT','Australian Capital Territory':'ACT',
    };
    let timer = null, lastQ = '', activeIdx = -1, results = [];

    function close(){ box.classList.remove('is-open'); box.innerHTML = ''; activeIdx = -1; }
    function open(){ box.classList.add('is-open'); }

    function render(){
      if(!results.length){ close(); return; }
      const userNumberMatch = (input.value || '').trim().match(/^\\s*(\\d+[a-zA-Z]?)\\b/);
      const userNumber = userNumberMatch ? userNumberMatch[1] : '';
      box.innerHTML = results.map((r,i) => {
        const a = r.address || {};
        const apiStreet = [a.house_number, a.road].filter(Boolean).join(' ') || a.road || '';
        const street = (userNumber && !a.house_number && a.road)
          ? userNumber + ' ' + a.road
          : (apiStreet || r.display_name.split(',')[0]);
        const suburb = a.suburb || a.city || a.town || a.village || a.municipality || '';
        const region = stateMap[a.state] || a.state || '';
        const post = a.postcode || '';
        const meta = [suburb, region, post].filter(Boolean).join(' · ');
        return \`<div class="address-suggest__item\${i===activeIdx?' is-active':''}" data-i="\${i}" role="option">
                  <strong>\${street}</strong>
                  <span>\${meta || r.display_name}</span>
                </div>\`;
      }).join('');
      open();
      box.querySelectorAll('.address-suggest__item').forEach(el => {
        el.addEventListener('mousedown', (e) => { e.preventDefault(); pick(parseInt(el.dataset.i,10)); });
      });
    }

    function pick(i){
      const r = results[i]; if(!r) return;
      const a = r.address || {};
      const userTyped = input.value.trim();
      const userNumberMatch = userTyped.match(/^\\s*(\\d+[a-zA-Z]?)\\b/);
      const apiStreet = [a.house_number, a.road].filter(Boolean).join(' ').trim();
      if (a.house_number && apiStreet){
        input.value = apiStreet;
      } else if (userNumberMatch && a.road){
        input.value = userNumberMatch[1] + ' ' + a.road;
      } else {
        input.value = apiStreet || userTyped || r.display_name.split(',')[0];
      }
      if(sub) sub.value = a.suburb || a.city || a.town || a.village || a.municipality || '';
      if(stEl){
        const code = stateMap[a.state];
        if(code) stEl.value = code;
      }
      if(post) post.value = a.postcode || '';
      close();
      [input, sub, stEl, post].forEach(el => {
        if(!el) return;
        const row = el.closest('.row');
        if(row) row.classList.remove('has-error');
      });
      rebuildSummary();
      const lat = parseFloat(r.lat), lon = parseFloat(r.lon);
      if (!isNaN(lat) && !isNaN(lon)){
        window.WV_LATLON = { lat: lat, lon: lon, label: input.value };
        renderPropMap(lat, lon, input.value);
      }
    }

    function fetchSuggest(q){
      const url = 'https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=au&addressdetails=1&limit=6&q=' + encodeURIComponent(q);
      return fetch(url, { headers: { 'Accept-Language':'en-AU' }})
        .then(r => r.ok ? r.json() : []);
    }

    input.addEventListener('input', () => {
      const q = input.value.trim();
      if(q === lastQ) return;
      lastQ = q;
      if(q.length < 4){ close(); return; }
      clearTimeout(timer);
      timer = setTimeout(() => {
        box.innerHTML = '<div class="address-suggest__loading">Searching…</div>';
        open();
        fetchSuggest(q).then(arr => {
          if(input.value.trim() !== q) return;
          results = Array.isArray(arr) ? arr : [];
          render();
        }).catch(() => close());
      }, 280);
    });

    input.addEventListener('keydown', (e) => {
      if(!box.classList.contains('is-open')) return;
      if(e.key === 'ArrowDown'){ e.preventDefault(); activeIdx = Math.min(results.length-1, activeIdx+1); render(); }
      else if(e.key === 'ArrowUp'){ e.preventDefault(); activeIdx = Math.max(0, activeIdx-1); render(); }
      else if(e.key === 'Enter' && activeIdx >= 0){ e.preventDefault(); pick(activeIdx); }
      else if(e.key === 'Escape'){ close(); }
    });

    document.addEventListener('click', (e) => {
      if(!box.contains(e.target) && e.target !== input) close();
    });
  })();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
`}</Script>
    </>
  );
}
