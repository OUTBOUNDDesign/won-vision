import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { Wordmark } from '../../components/Wordmark';

export const metadata: Metadata = {
  title: 'Booking confirmed',
  description:
    'Your Won Vision real estate shoot booking is locked in. The studio will reach out within one working day to confirm details.',
};

export default function ConfirmationPage() {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <style>{`
  .confirm-map{
    position:relative;
    height:280px;max-width:520px;margin:32px auto;
    background:var(--soft);
    border:1px solid rgba(74,74,72,0.16);
    overflow:hidden;
  }
  .confirm-map__canvas{
    position:absolute;inset:0;background:var(--soft);
    filter:grayscale(1) contrast(1.05) brightness(0.97) sepia(0.04) hue-rotate(180deg) saturate(0.4);
  }
  .confirm-map .leaflet-container{background:var(--soft) !important;outline:none !important}
  .confirm-map .leaflet-control-attribution,
  .confirm-map .leaflet-control-zoom,
  .confirm-map .leaflet-control-container{display:none !important}
  .confirm-map__label{
    position:absolute;top:14px;left:14px;z-index:5;
    background:var(--paper);padding:8px 12px;
    font-family:var(--body);font-size:10px;letter-spacing:0.22em;text-transform:uppercase;
    color:var(--ink);font-weight:600;
    border:1px solid rgba(74,74,72,0.15);
  }
  .map-pulse{transform-origin:center;animation:cmPulse 2.4s ease-in-out infinite}
  @keyframes cmPulse{
    0%,100%{stroke-opacity:0.55;fill-opacity:0.18;transform:scale(1)}
    50%{stroke-opacity:0.2;fill-opacity:0.05;transform:scale(1.5)}
  }
  @media (max-width:560px){
    .confirm-map{height:200px;margin:24px auto}
    .confirm-map__label{font-size:9px;padding:6px 10px}
    .confirm-page__check{width:56px;height:56px;font-size:24px}
    .confirm-page__portal{padding:20px;margin:24px auto}
    .confirm-page__portal h4{font-size:18px}
    .confirm-page__portal p{font-size:13px}
    .confirm-page__portal a{padding:12px 18px;font-size:11px}
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

      <section className="confirm-page">
        <div className="progress">
          <div className="progress__step is-done"><span className="progress__num">1</span><span>Cart</span></div>
          <span className="progress__line is-done"></span>
          <div className="progress__step is-done"><span className="progress__num">2</span><span>Details</span></div>
          <span className="progress__line is-done"></span>
          <div className="progress__step is-done"><span className="progress__num">3</span><span>Schedule</span></div>
          <span className="progress__line is-done"></span>
          <div className="progress__step is-active"><span className="progress__num">4</span><span>Confirm</span></div>
        </div>

        <div className="confirm-page__inner">
          <div className="confirm-page__check">✓</div>
          <h1>Booking <em>locked in.</em></h1>
          <p className="lede">Studio will reach out within one working day to confirm details and send the call sheet.</p>
          <span className="confirm-page__ref" id="bookingRef">Ref: WV-PENDING</span>

          <div className="confirm-map" id="confirmMap" hidden>
            <div className="confirm-map__canvas" id="confirmMapCanvas" aria-label="Booked property location"></div>
            <div className="confirm-map__label" id="confirmMapLabel">Property location</div>
          </div>

          <div className="confirm-page__portal" id="portalCard">
            <h4>Your client portal</h4>
            <p id="portalCopy">Track shoot status, download files when ready, and message the studio — all from a single page tied to this booking.</p>
            <a href="#" id="portalLink" target="_blank" rel="noopener" hidden>Open client portal →</a>
            <p id="portalPending" style={{ fontSize: 13, color: 'var(--graphite)', margin: 0 }}>We'll email your portal link to <strong id="portalPendingEmail">your address</strong> shortly.</p>
          </div>

          <p style={{ fontSize: 13, color: 'var(--graphite)', marginTop: 24 }}>A confirmation email has been sent to <strong id="clientEmail" style={{ color: 'var(--ink)' }}>your address</strong>.<br />If urgent, call <a href="tel:+61000000000" style={{ color: 'var(--fg)', textDecoration: 'underline' }}>+61 (0) 0000 0000</a>.</p>
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

      <Script
        src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
        crossOrigin=""
        strategy="afterInteractive"
      />
      <Script src="https://ops.outbounddesign.com.au/booking-submit.js" strategy="afterInteractive" />
      <Script id="wv-confirm" strategy="afterInteractive">{`
(function(){
  function boot(){
    const cart = JSON.parse(sessionStorage.getItem('wv-cart') || '[]');
    const details = JSON.parse(sessionStorage.getItem('wv-details') || '{}');
    const schedule = JSON.parse(sessionStorage.getItem('wv-schedule') || '{}');
    if (!cart.length) { window.location.href = '/book'; return; }
    if (!details.email) { window.location.href = '/book/checkout'; return; }
    if (!schedule.selectedDate) { window.location.href = '/book/schedule'; return; }

    const fallbackRef = 'WV-' + Date.now().toString(36).toUpperCase().slice(-6);
    const refEl = document.getElementById('bookingRef');
    const linkEl = document.getElementById('portalLink');
    const emailEl = document.getElementById('clientEmail');
    refEl.textContent = 'Ref: ' + fallbackRef;
    if (details.email) emailEl.textContent = details.email;

    function applyPortal(jobNumber, response){
      const ref = jobNumber || (response && response.jobNumber) || fallbackRef;
      refEl.textContent = 'Ref: ' + ref;
      const realUrl = response && (response.portalUrl || response.portal_url || response.clientUrl);
      const pendingEmailEl = document.getElementById('portalPendingEmail');
      const pendingEl = document.getElementById('portalPending');
      if (realUrl){
        linkEl.href = realUrl;
        linkEl.hidden = false;
        if (pendingEl) pendingEl.hidden = true;
      } else {
        linkEl.removeAttribute('href');
        linkEl.hidden = true;
        if (pendingEl){
          pendingEl.hidden = false;
          if (pendingEmailEl && details.email) pendingEmailEl.textContent = details.email;
        }
      }
    }

    const booking = {
      services: cart,
      property: {
        address: details.address || '',
        unit: details.unit || '',
        suburb: details.suburb || '',
        state: details.state || '',
        postcode: details.postcode || '',
        country: details.country || 'Australia',
        notes: details.propertyNotes || '',
        lat: details.lat || null,
        lon: details.lon || null,
      },
      contact: {
        firstName: details.firstName || '',
        lastName: details.lastName || '',
        email: details.email || '',
        phone: details.phone || '',
        agency: details.agency || '',
        agency_location: details.agencyLocation || null,
      },
      schedule: {
        date: schedule.selectedDate || '',
        time: schedule.selectedTime || '',
        accessMethod: schedule.accessMethod || '',
        accessNotes: schedule.accessNotes || '',
        meetingPerson: schedule.meetingPerson || (schedule.meetingRole || ''),
        accessPhone: schedule.accessPhone || '',
        anytime: schedule.anytime || '',
      },
      paymentMethod: schedule.paymentMethod || '',
      notes: details.propertyNotes || '',
      discountCode: schedule.discountCode || '',
    };

    (function(){
      const lat = parseFloat(details.lat), lon = parseFloat(details.lon);
      if (isNaN(lat) || isNaN(lon) || typeof L === 'undefined') return;
      const wrap = document.getElementById('confirmMap');
      const canvas = document.getElementById('confirmMapCanvas');
      const lbl = document.getElementById('confirmMapLabel');
      if (!wrap || !canvas) return;
      wrap.hidden = false;
      const label = [details.address, details.suburb].filter(Boolean).join(', ');
      if (lbl && label) lbl.textContent = label;
      const map = L.map(canvas, {
        attributionControl:false, zoomControl:false,
        scrollWheelZoom:false, doubleClickZoom:false, dragging:false,
        touchZoom:false, boxZoom:false, keyboard:false, tap:false,
      });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
        subdomains:'abcd', maxZoom:19, crossOrigin:true,
      }).addTo(map);
      map.setView([lat, lon], 17);
      L.circleMarker([lat, lon], {
        radius:8, color:'#FAFAF7', weight:2, fillColor:'#4A6178', fillOpacity:1, interactive:false,
      }).addTo(map);
      setTimeout(() => map.invalidateSize(), 80);
    })();

    function showSubmitError(err){
      var msg = (err && err.message) ? err.message : String(err || 'Booking submit failed');
      console.error('[OutboundOps]', err);
      var banner = document.getElementById('bookingError');
      if (!banner){
        banner = document.createElement('div');
        banner.id = 'bookingError';
        banner.style.cssText = 'margin:16px auto;max-width:560px;padding:12px 16px;border:1px solid #B33A3A;background:#FFF4F4;color:#7A1F1F;border-radius:8px;font-size:14px;line-height:1.4;text-align:left';
        var ref = document.getElementById('bookingRef');
        if (ref && ref.parentNode) ref.parentNode.insertBefore(banner, ref.nextSibling);
        else document.body.insertBefore(banner, document.body.firstChild);
      }
      banner.textContent = 'We saved your booking locally but couldn\\'t reach the studio system: ' + msg + '. Please contact us to confirm.';
    }

    if (window.OutboundOps && typeof window.OutboundOps.submitBooking === 'function') {
      window.OutboundOps.submitBooking({
        slug: 'won-vision',
        booking: booking,
        onSuccess: applyPortal,
        onError: showSubmitError,
      });
    } else {
      applyPortal(fallbackRef, {});
      showSubmitError(new Error('Ops helper script failed to load'));
    }

    setTimeout(() => {
      sessionStorage.removeItem('wv-cart');
      sessionStorage.removeItem('wv-details');
      sessionStorage.removeItem('wv-schedule');
    }, 1500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
`}</Script>
    </>
  );
}
