import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { Wordmark } from '../../components/Wordmark';

export const metadata: Metadata = {
  title: 'Schedule',
  description:
    'Pick a date and time for your Won Vision real estate shoot — weekday slots and weekend availability on request.',
};

export default function SchedulePage() {
  return (
    <>
      <style>{`
  .datetime-row{
    display:grid;grid-template-columns:auto 1fr;gap:24px;align-items:end;
    margin-bottom:18px;
  }
  .datetime-row .row{margin-bottom:0}
  .datetime-row__date input{min-width:200px}
  .datetime-row__time .slots{grid-template-columns:repeat(4,1fr)}
  .time-row{margin-top:8px}
  .time-slots{grid-template-columns:repeat(6,1fr)}
  .step-form .hint{display:block;margin-top:6px;font-family:var(--body);font-size:11px;line-height:1.5;color:var(--graphite)}
  @media (max-width:760px){
    .datetime-row{grid-template-columns:1fr;gap:14px}
    .datetime-row__time .slots{grid-template-columns:repeat(2,1fr)}
    .time-slots{grid-template-columns:repeat(3,1fr)}
  }
  #meetingFields{
    transition:opacity .25s ease, max-height .35s ease;
    overflow:hidden;
  }
  #meetingFields[hidden]{display:none}

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
    padding:14px 18px;margin-bottom:24px;
  }
  .form-errors strong{display:block;font-family:var(--display);font-weight:500;font-size:16px;color:#a23f28;margin-bottom:6px}
  .form-errors ul{list-style:none;margin:0;padding:0;font-size:13px;line-height:1.7}
  .form-errors li::before{content:'\\2014 ';color:#c4543a}
  .form-errors[hidden]{display:none}

  @media (max-width:760px){
    .datetime-row__date input{min-width:0;width:100%}
    .time-slots{grid-template-columns:repeat(3,1fr)}
    .step-form .row.two{grid-template-columns:1fr;gap:12px}
    .form-errors{padding:12px 14px}
    .form-errors strong{font-size:14px}
    .form-errors ul{font-size:12px}
  }
  @media (max-width:440px){
    .time-slots{grid-template-columns:repeat(2,1fr)}
    #paymentSlots{grid-template-columns:1fr !important}
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
          <div className="progress__step is-done"><span className="progress__num">2</span><span>Details</span></div>
          <span className="progress__line is-done"></span>
          <div className="progress__step is-active"><span className="progress__num">3</span><span>Schedule</span></div>
          <span className="progress__line"></span>
          <div className="progress__step"><span className="progress__num">4</span><span>Confirm</span></div>
        </div>

        <div className="step-inner">
          <form className="step-form" id="scheduleForm" noValidate>
            <h2>Pick a <em>date &amp; time.</em></h2>
            <p className="lede">Studio runs two shoots per day on weekdays. Weekend availability on request.</p>

            <section>
              <h3>Date &amp; time</h3>

              <div className="row" style={{ marginBottom: 16 }}>
                <button type="button" id="anytimeBtn" data-anytime="1"
                        className="slot"
                        style={{ width: '100%', padding: 18, fontSize: 14, letterSpacing: '.05em' }}>
                  ANYTIME · 8AM–5PM <span style={{ opacity: .7, fontWeight: 'normal', textTransform: 'none', letterSpacing: 0 }}>(let the studio pick)</span>
                </button>
              </div>

              <div className="datetime-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
                <div className="row datetime-row__date" style={{ margin: 0 }}>
                  <label htmlFor="selectedDate">Preferred date</label>
                  <input id="selectedDate" name="selectedDate" type="date" required
                         style={{ height: 52, padding: '0 14px', font: 'inherit' }} />
                </div>
                <div className="row datetime-row__time" style={{ margin: 0 }}>
                  <label>Or pick a window</label>
                  <div className="slots" id="windows"
                       style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                    <button type="button" className="slot" data-window="morning"   style={{ height: 52 }}>Morning</button>
                    <button type="button" className="slot" data-window="midday"    style={{ height: 52 }}>Midday</button>
                    <button type="button" className="slot" data-window="afternoon" style={{ height: 52 }}>Afternoon</button>
                    <button type="button" className="slot" data-window="twilight"  style={{ height: 52 }}>Twilight</button>
                  </div>
                  <input type="hidden" id="selectedWindow" name="selectedWindow" />
                  <input type="hidden" id="selectedTime" name="selectedTime" required />
                  <input type="hidden" id="anytime" name="anytime" />
                </div>
              </div>

              <div className="row time-row" id="timeRow" hidden style={{ marginTop: 16 }}>
                <label id="timeRowLabel">Pick a start time</label>
                <div className="slots time-slots" id="timeSlots"></div>
                <small className="hint" id="timeHint">Hourly arrival times. Final slot confirmed by the studio.</small>
              </div>
            </section>

            <section>
              <h3>Property access</h3>
              <div className="row">
                <label htmlFor="accessMethod">How do we get in?</label>
                <select id="accessMethod" name="accessMethod">
                  <option value="meeting">Owner / agent meeting on site</option>
                  <option value="lockbox">Lockbox</option>
                  <option value="vacant">Vacant — open</option>
                  <option value="other">Other (note below)</option>
                </select>
              </div>
              <div className="meeting-block" id="meetingFields">
                <div className="row two">
                  <div>
                    <label htmlFor="meetingRole">Their role</label>
                    <select id="meetingRole" name="meetingRole">
                      <option value="agent">Agent</option>
                      <option value="owner">Owner</option>
                      <option value="tenant">Tenant</option>
                      <option value="property-manager">Property manager</option>
                      <option value="stylist">Stylist</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="meetingPerson">Their name</label>
                    <input id="meetingPerson" name="meetingPerson" type="text" placeholder="Full name" autoComplete="name" />
                  </div>
                </div>
                <div className="row" id="phoneRow">
                  <label htmlFor="accessPhone">Their phone</label>
                  <input id="accessPhone" name="accessPhone" type="tel" placeholder="04XX XXX XXX" autoComplete="tel" />
                  <small className="hint" id="phoneHint">If we can't reach you on shoot day.</small>
                </div>
              </div>
              <div className="row">
                <label htmlFor="accessNotes" id="accessNotesLabel">Access notes</label>
                <textarea id="accessNotes" name="accessNotes" rows={3} placeholder="Anything we should know on arrival?"
                  style={{ width: '100%', padding: 12, border: '1px solid rgba(0,0,0,.18)', borderRadius: 6, font: 'inherit', color: 'inherit', background: 'transparent', resize: 'vertical' }}></textarea>
                <small className="hint" id="accessNotesHint">Anything our shooter should know — gates, parking, pets, alarms.</small>
              </div>
            </section>

            <section>
              <h3>Promo code</h3>
              <div className="row">
                <label htmlFor="promoCode">Have a code?</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
                  <input
                    id="promoCode"
                    name="promoCode"
                    type="text"
                    autoComplete="off"
                    placeholder="Enter code"
                    style={{ flex: 1, letterSpacing: '0.04em' }}
                  />
                  <button
                    type="button"
                    id="promoApply"
                    style={{
                      padding: '0 18px',
                      background: 'var(--ink)',
                      color: 'var(--paper)',
                      border: 'none',
                      fontFamily: 'var(--body)',
                      fontSize: 12,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                    }}
                  >Apply</button>
                  <button
                    type="button"
                    id="promoClear"
                    hidden
                    style={{
                      padding: '0 14px',
                      background: 'transparent',
                      color: 'var(--graphite)',
                      border: '1px solid rgba(74,74,72,0.2)',
                      fontFamily: 'var(--body)',
                      fontSize: 12,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                    }}
                  >Clear</button>
                </div>
                <small className="hint" id="promoMsg">Codes from your studio — applied to the total below.</small>
                <input type="hidden" name="discountCode" id="discountCode" defaultValue="" />
                <input type="hidden" name="discountAmount" id="discountAmount" defaultValue="0" />
              </div>
            </section>

            <section>
              <h3>Payment method</h3>
              <div className="row">
                <label>How would you like to pay?</label>
                <div className="slots" id="paymentSlots" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
                  <button type="button" className="slot" data-pay="Card on confirm">Card · pay now</button>
                  <button type="button" className="slot is-active" data-pay="Invoice 30-day">Invoice · up to 30 days</button>
                </div>
                <input type="hidden" name="paymentMethod" id="paymentMethod" defaultValue="Invoice 30-day" />
              </div>
            </section>

            <div className="form-errors" id="formErrors" hidden role="alert" aria-live="polite">
              <strong>A few things still missing</strong>
              <ul id="formErrorsList"></ul>
            </div>

            <div className="step-actions">
              <Link href="/book/checkout" className="step-back">← Edit details</Link>
              <button type="submit" className="step-submit">Confirm booking →</button>
            </div>
          </form>

          <aside className="step-summary">
            <h3>Your booking</h3>
            <div className="step-summary__list" id="summaryList"></div>
            <div
              id="summaryDiscountRow"
              hidden
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                padding: '10px 0',
                borderTop: '1px solid rgba(74,74,72,0.12)',
                fontFamily: 'var(--body)',
                fontSize: 13,
                color: 'var(--graphite)',
              }}
            >
              <span id="summaryDiscountLabel">Discount</span>
              <span id="summaryDiscountAmt">-$0</span>
            </div>
            <div className="step-summary__total">
              <span className="step-summary__total__label">Total · GST inc.</span>
              <span className="step-summary__total__amt" id="summaryAmt">$0</span>
            </div>
            <Link href="/book/checkout" className="step-summary__edit">← Edit details</Link>
          </aside>
        </div>
      </section>

      <footer className="foot">
        <div className="foot__inner">
          <div className="foot__top">
            <div>
              <Link href="/#top" data-home aria-label="Won Vision — home"><Wordmark /></Link>
              <p>A Melbourne property media studio.</p>
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

      <Script id="wv-schedule" strategy="afterInteractive">{`
(function(){
  function boot(){
  const cart = JSON.parse(sessionStorage.getItem('wv-cart') || '[]');
  const details = JSON.parse(sessionStorage.getItem('wv-details') || '{}');
  if (!cart.length) { window.location.href = '/book'; return; }
  if (!details.email) { window.location.href = '/book/checkout'; return; }

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
  function money(n){ return n === 0 ? '$0' : '$' + Number(n).toLocaleString('en-AU'); }
  function renderTotal(){
    const disc = Math.max(0, Math.min(total, Number(document.getElementById('discountAmount').value || 0)));
    const net = Math.max(0, total - disc);
    document.getElementById('summaryAmt').textContent = money(net);
    const row = document.getElementById('summaryDiscountRow');
    const amt = document.getElementById('summaryDiscountAmt');
    const lbl = document.getElementById('summaryDiscountLabel');
    const code = document.getElementById('discountCode').value;
    if (disc > 0){
      row.hidden = false;
      lbl.textContent = code ? ('Discount · ' + code) : 'Discount';
      amt.textContent = '-' + money(disc);
    } else {
      row.hidden = true;
    }
  }
  renderTotal();

  // ── Promo code ────────────────────────────────────────────────────────────
  (function(){
    const OPS_BASE = 'https://ops.outbounddesign.com.au';
    const TENANT_SLUG = 'won-vision';
    const input = document.getElementById('promoCode');
    const apply = document.getElementById('promoApply');
    const clear = document.getElementById('promoClear');
    const msg   = document.getElementById('promoMsg');
    const hCode = document.getElementById('discountCode');
    const hAmt  = document.getElementById('discountAmount');

    function setMsg(text, tone){
      msg.textContent = text;
      msg.style.color = tone === 'ok' ? '#2f6f4a' : tone === 'err' ? '#a23f28' : 'var(--graphite)';
    }
    function clearPromo(){
      hCode.value = '';
      hAmt.value = '0';
      input.value = '';
      input.disabled = false;
      apply.hidden = false;
      clear.hidden = true;
      setMsg('Codes from your studio — applied to the total below.', '');
      renderTotal();
    }
    // Restore any prior promo on back-nav
    (function(){
      const prior = JSON.parse(sessionStorage.getItem('wv-schedule') || '{}');
      if (prior.discountCode && prior.discountAmount){
        hCode.value = prior.discountCode;
        hAmt.value = String(prior.discountAmount);
        input.value = prior.discountCode;
        input.disabled = true;
        apply.hidden = true;
        clear.hidden = false;
        setMsg('“' + prior.discountCode + '” applied · saving ' + money(Number(prior.discountAmount)), 'ok');
        renderTotal();
      }
    })();

    apply.addEventListener('click', async () => {
      // Server matches case-insensitively, so we just trim. The validated
      // response echoes back the DB-stored casing, which is what we display.
      const code = (input.value || '').trim();
      if (!code) { setMsg('Type a code first.', 'err'); return; }
      apply.disabled = true;
      setMsg('Checking…', '');
      try {
        // Single-package validation when the cart has one line (most bookings);
        // for multi-line carts, validate against the total and let the server
        // re-check applicable_packages for each line.
        const pkg = (cart[0] && cart[0].name) || undefined;
        const res = await fetch(OPS_BASE + '/api/public/' + TENANT_SLUG + '/validate-discount', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: code, package_type: pkg, package_price: total }),
        });
        const j = await res.json();
        if (!res.ok || !j.valid){
          setMsg(j.message || 'Invalid code', 'err');
          return;
        }
        hCode.value = j.code || code;
        hAmt.value = String(j.discount_amount || 0);
        input.disabled = true;
        apply.hidden = true;
        clear.hidden = false;
        setMsg('“' + (j.code || code) + '” applied · saving ' + money(j.discount_amount || 0), 'ok');
        renderTotal();
      } catch (e){
        setMsg('Couldn\\'t reach the server. Try again.', 'err');
      } finally {
        apply.disabled = false;
      }
    });

    clear.addEventListener('click', clearPromo);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter'){ e.preventDefault(); apply.click(); }
    });
  })();

  const today = new Date().toISOString().split('T')[0];
  document.getElementById('selectedDate').min = today;

  const accessSel = document.getElementById('accessMethod');
  const meetingFields = document.getElementById('meetingFields');
  const accessNotesEl = document.getElementById('accessNotes');
  const accessNotesLabel = document.getElementById('accessNotesLabel');
  const accessNotesHint = document.getElementById('accessNotesHint');
  const ACCESS_NOTE_COPY = {
    meeting: { label: 'Anything else we should know?', placeholder: 'Buzzer, parking, pets…',
               hint: 'Optional — gates, alarm codes, pets, anything else we should know.' },
    lockbox: { label: 'Lockbox details', placeholder: 'Lockbox code + location (e.g. 1234, on the front gate)',
               hint: 'Required for lockbox access — code and where it\\'s located.' },
    vacant:  { label: 'Vacant entry instructions', placeholder: 'Front door unlocked / key under mat / alarm code…',
               hint: 'Tell us how we get in and disable any alarms.' },
    other:   { label: 'Access details', placeholder: 'Tell us how to get in',
               hint: 'Required — describe how we should access the property.' },
  };
  function toggleAccessFields(){
    const v = accessSel.value;
    const hide = (v === 'lockbox' || v === 'vacant');
    if (hide){
      meetingFields.hidden = true;
      meetingFields.querySelectorAll('input').forEach(i => { i.value = ''; });
    } else {
      meetingFields.hidden = false;
    }
    const cfg = ACCESS_NOTE_COPY[v] || ACCESS_NOTE_COPY.meeting;
    if (accessNotesLabel) accessNotesLabel.textContent = cfg.label;
    if (accessNotesEl) accessNotesEl.placeholder = cfg.placeholder;
    if (accessNotesHint) accessNotesHint.textContent = cfg.hint;
  }
  accessSel.addEventListener('change', toggleAccessFields);
  toggleAccessFields();

  const roleSel = document.getElementById('meetingRole');
  const phoneRow = document.getElementById('phoneRow');
  function togglePhoneRow(){
    if (!roleSel || !phoneRow) return;
    const isAgent = roleSel.value === 'agent';
    phoneRow.hidden = isAgent;
    if (isAgent){
      const ph = document.getElementById('accessPhone');
      if (ph) ph.value = '';
    }
  }
  if (roleSel) roleSel.addEventListener('change', togglePhoneRow);
  togglePhoneRow();

  const WINDOWS = {
    morning:   { label:'Morning · 8–11am',  slots:['8:00 AM','9:00 AM','10:00 AM','11:00 AM'] },
    midday:    { label:'Midday · 11am–2pm', slots:['11:00 AM','12:00 PM','1:00 PM','2:00 PM'] },
    afternoon: { label:'Afternoon · 2–5pm', slots:['2:00 PM','3:00 PM','4:00 PM','5:00 PM'] },
    twilight:  { label:'Twilight · 5–7pm',  slots:['5:00 PM','6:00 PM','7:00 PM'] },
  };
  const windowsEl = document.getElementById('windows');
  const timeRow   = document.getElementById('timeRow');
  const timeSlots = document.getElementById('timeSlots');
  const timeLabel = document.getElementById('timeRowLabel');
  const selectedWindowEl = document.getElementById('selectedWindow');
  const selectedTimeEl   = document.getElementById('selectedTime');

  function renderTimes(windowKey, preselect){
    const w = WINDOWS[windowKey];
    if(!w){ timeRow.hidden = true; return; }
    timeLabel.textContent = 'Pick an arrival time · ' + w.label;
    timeSlots.innerHTML = w.slots.map(t => {
      const active = (t === preselect) ? ' is-active' : '';
      return '<button type="button" class="slot' + active + '" data-time="' + t + '">' + t + '</button>';
    }).join('');
    timeRow.hidden = false;
    timeSlots.querySelectorAll('.slot').forEach(b => {
      b.addEventListener('click', () => {
        timeSlots.querySelectorAll('.slot').forEach(x => x.classList.remove('is-active'));
        b.classList.add('is-active');
        selectedTimeEl.value = b.dataset.time;
      });
    });
  }

  const anytimeBtn = document.getElementById('anytimeBtn');
  const anytimeEl  = document.getElementById('anytime');
  const dateEl     = document.getElementById('selectedDate');

  function clearWindowSelection(){
    windowsEl.querySelectorAll('.slot').forEach(x => x.classList.remove('is-active'));
    timeRow.hidden = true;
    selectedWindowEl.value = '';
    selectedTimeEl.value = '';
  }
  function setAnytime(active){
    if (active){
      clearWindowSelection();
      timeRow.hidden = true;
      timeRow.style.display = 'none';
      timeSlots.innerHTML = '';
      anytimeBtn.classList.add('is-active');
      anytimeEl.value = 'anytime';
      selectedWindowEl.value = 'Anytime · 8am–5pm';
      selectedTimeEl.value = '8:00 AM';
    } else {
      anytimeBtn.classList.remove('is-active');
      anytimeEl.value = '';
      timeRow.style.display = '';
      if (selectedWindowEl.value === 'Anytime · 8am–5pm'){
        selectedWindowEl.value = '';
        selectedTimeEl.value = '';
      }
    }
  }
  anytimeBtn.addEventListener('click', () => {
    setAnytime(!anytimeBtn.classList.contains('is-active'));
  });

  windowsEl.querySelectorAll('.slot').forEach(b => {
    b.addEventListener('click', () => {
      setAnytime(false);
      windowsEl.querySelectorAll('.slot').forEach(x => x.classList.remove('is-active'));
      b.classList.add('is-active');
      const key = b.dataset.window;
      selectedWindowEl.value = WINDOWS[key].label;
      selectedTimeEl.value = '';
      renderTimes(key);
    });
  });

  const OPS_BASE = 'https://ops.outbounddesign.com.au';
  const TENANT_SLUG = 'won-vision';
  let availableSlots24h = null;
  function to24h(label){
    const m = String(label).match(/^(\\d{1,2}):(\\d{2})\\s*(AM|PM)$/i);
    if (!m) return null;
    let hr = parseInt(m[1], 10);
    const pm = /pm/i.test(m[3]);
    if (pm && hr < 12) hr += 12;
    if (!pm && hr === 12) hr = 0;
    return String(hr).padStart(2, '0') + ':' + m[2];
  }
  function applySlotAvailability(){
    const buttons = timeSlots.querySelectorAll('.slot');
    buttons.forEach(btn => {
      if (availableSlots24h == null){
        btn.disabled = false;
        btn.style.opacity = '';
        btn.title = '';
        return;
      }
      const t24 = to24h(btn.dataset.time);
      const ok  = t24 && availableSlots24h.includes(t24);
      btn.disabled = !ok;
      btn.style.opacity = ok ? '' : '0.4';
      btn.style.cursor = ok ? '' : 'not-allowed';
      btn.title = ok ? '' : 'Not available — try another time';
    });
    const hint = document.getElementById('timeHint');
    if (hint && availableSlots24h){
      hint.textContent = availableSlots24h.length
        ? 'Live availability shown. Greyed-out times are already booked.'
        : 'No remaining slots for this date — try another day.';
    }
  }
  const _origRenderTimes = renderTimes;
  renderTimes = function(windowKey, preselect){
    _origRenderTimes(windowKey, preselect);
    applySlotAvailability();
  };
  async function refreshAvailability(){
    const date = dateEl && dateEl.value;
    if (!date) { availableSlots24h = null; applySlotAvailability(); return; }
    try {
      const url = OPS_BASE + '/api/public/' + encodeURIComponent(TENANT_SLUG) +
        '/availability/slots?date=' + encodeURIComponent(date) +
        '&duration=60' +
        '&address=' + encodeURIComponent(details.address || '') +
        '&suburb='  + encodeURIComponent(details.suburb || '');
      const r = await fetch(url, { credentials: 'omit' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const j = await r.json();
      availableSlots24h = Array.isArray(j.specific_slots) ? j.specific_slots : null;
    } catch (err) {
      console.warn('[availability] fetch failed, falling back to static grid:', err);
      availableSlots24h = null;
    }
    applySlotAvailability();
  }
  if (dateEl) dateEl.addEventListener('change', refreshAvailability);
  document.querySelectorAll('#paymentSlots .slot').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('#paymentSlots .slot').forEach(x => x.classList.remove('is-active'));
      b.classList.add('is-active');
      document.getElementById('paymentMethod').value = b.dataset.pay;
    });
  });

  const prior = JSON.parse(sessionStorage.getItem('wv-schedule') || '{}');
  Object.entries(prior).forEach(([k,v]) => {
    const el = document.querySelector(\`[name="\${k}"]\`);
    if (el && typeof v === 'string'){
      el.value = v;
      if (k === 'paymentMethod'){
        const match = document.querySelector(\`#paymentSlots .slot[data-pay="\${v}"]\`);
        if (match){ document.querySelectorAll('#paymentSlots .slot').forEach(x=>x.classList.remove('is-active')); match.classList.add('is-active'); }
      }
    }
  });
  if (prior.selectedWindow){
    const winKey = Object.keys(WINDOWS).find(k => WINDOWS[k].label === prior.selectedWindow);
    if (winKey){
      const winBtn = windowsEl.querySelector('.slot[data-window="' + winKey + '"]');
      if (winBtn){
        windowsEl.querySelectorAll('.slot').forEach(x=>x.classList.remove('is-active'));
        winBtn.classList.add('is-active');
        renderTimes(winKey, prior.selectedTime || '');
        if (prior.selectedTime) selectedTimeEl.value = prior.selectedTime;
      }
    }
  }
  toggleAccessFields();
  if (prior.anytime === 'anytime') setAnytime(true);
  if (dateEl && dateEl.value) refreshAvailability();

  const form = document.getElementById('scheduleForm');
  const errBox = document.getElementById('formErrors');
  const errList = document.getElementById('formErrorsList');
  const labelOf = (el, custom) => custom || ((el.closest('.row') && el.closest('.row').querySelector('label') && el.closest('.row').querySelector('label').textContent.trim()) || el.name);

  form.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input', () => {
      const row = el.closest('.row');
      if (row && row.classList.contains('has-error') && el.value.trim()){
        row.classList.remove('has-error');
        rebuildSummary();
      }
    });
  });
  function rebuildSummary(){
    const stillBad = Array.from(form.querySelectorAll('.row.has-error label')).map(l => l.textContent.trim());
    const list = stillBad.slice();
    if (!selectedWindowEl.value) list.push('Time window');
    else if (!selectedTimeEl.value) list.push('Arrival time');
    if (!list.length) { errBox.hidden = true; return; }
    errList.innerHTML = list.map(t => \`<li>\${t}</li>\`).join('');
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const required = form.querySelectorAll('[required]');
    const missing = [];
    required.forEach(el => {
      const row = el.closest('.row');
      if (!el.value.trim()){
        row && row.classList.add('has-error');
        missing.push(labelOf(el));
      } else {
        row && row.classList.remove('has-error');
      }
    });
    if (!selectedWindowEl.value){
      missing.push('Time window');
    } else if (!selectedTimeEl.value){
      missing.push('Arrival time');
    }

    if (missing.length){
      errList.innerHTML = missing.map(t => \`<li>\${t}</li>\`).join('');
      errBox.hidden = false;
      const firstBad = form.querySelector('.row.has-error input, .row.has-error select, .row.has-error textarea')
                     || form.querySelector('#selectedDate');
      if (firstBad){
        const rect = firstBad.getBoundingClientRect();
        window.scrollTo({top: rect.top + window.scrollY - 110, behavior:'smooth'});
        setTimeout(() => firstBad.focus({preventScroll:true}), 400);
      }
      return;
    }

    const data = {};
    new FormData(form).forEach((v,k) => data[k] = v);
    sessionStorage.setItem('wv-schedule', JSON.stringify(data));
    window.location.href = '/book/confirmation';
  });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
`}</Script>
    </>
  );
}
