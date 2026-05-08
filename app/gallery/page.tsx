import type { Metadata } from 'next';
import Link from 'next/link';
import { Wordmark } from '../components/Wordmark';

export const metadata: Metadata = {
  title: 'Gallery',
  description:
    'Won Vision gallery — selected Melbourne real estate photography, listing video, drone aerials, floor plans and virtual staging from across Melbourne and Victoria.',
};

export default function GalleryPage() {
  return (
    <>
      <header className="nav">
        <div className="nav__brand">
          <Link href="/#top" aria-label="Won Vision — home">
            <Wordmark />
          </Link>
        </div>
        <nav className="nav__links">
          <Link href="/#services">Services</Link>
          <Link href="/#contact">Contact</Link>
          <Link href="/gallery" aria-current="page">Gallery</Link>
        </nav>
        <div className="nav__right">
          <Link href="/book" className="nav__cta">Book now</Link>
        </div>
        <button className="nav__burger" aria-label="Menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
      </header>
      <aside className="nav__drawer" aria-hidden="true">
        <ul>
          <li><Link href="/#services">Services</Link></li>
          <li><Link href="/#contact">Contact</Link></li>
          <li><Link href="/gallery"><em>Gallery</em></Link></li>
          <li><Link href="/book" className="drawer-cta">Book now →</Link></li>
        </ul>
        <div className="nav__drawer__foot">
          <span>Won Vision</span><span>Melbourne · 2026</span>
        </div>
      </aside>

      {/* L — TYPE-AS-WINDOW HEADER */}
      <section className="gallery-hero">
        <div className="gallery-hero__bg"></div>
        <div className="gallery-hero__veil"></div>

        <header className="gallery-hero__top">
          <span className="eyebrow">Won Vision · Selected work</span>
        </header>

        <div className="gallery-hero__big">
          <h1 className="typed">GALLERY</h1>
        </div>
      </section>

      {/* FILTERS */}
      <div className="gallery-controls">
        <div className="gallery-controls__inner">
          <div className="filters" role="tablist">
            <button className="filter is-active" data-filter="all">All</button>
            <button className="filter" data-filter="photography">Photography</button>
            <button className="filter" data-filter="video">Video</button>
            <button className="filter" data-filter="drone">Drone</button>
            <button className="filter" data-filter="floorplan">Floor plans</button>
            <button className="filter" data-filter="staging">Virtual staging</button>
          </div>
          <div className="gallery-controls__view">
            <span data-gallery-count>14</span>
            <span>projects</span>
          </div>
        </div>
      </div>

      {/* GALLERY GRID */}
      <section className="gallery">
        <div className="gallery__grid">

          <article className="gallery__item s8" data-tags="photography video"
                   data-place="Carlton North · 12 Drummond Street"
                   data-full="https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?w=2400&q=90">
            <img src="https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?w=1600&q=85" alt="Carlton North living room" />
            <div className="gallery__item__caption">
              <p className="place">Carlton North</p>
              <p className="tags">Photography · Video</p>
            </div>
          </article>

          <article className="gallery__item s4" data-tags="photography"
                   data-place="Fitzroy · 4 Argyle Place"
                   data-full="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=2400&q=90">
            <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=85" alt="Fitzroy interior" />
            <div className="gallery__item__caption">
              <p className="place">Fitzroy</p>
              <p className="tags">Photography</p>
            </div>
          </article>

          <article className="gallery__item s4" data-tags="drone video"
                   data-place="Brunswick · 118 Lygon Street"
                   data-full="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=2400&q=90">
            <img src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=85" alt="Brunswick exterior aerial" />
            <div className="gallery__item__caption">
              <p className="place">Brunswick</p>
              <p className="tags">Drone · Video</p>
            </div>
          </article>

          <article className="gallery__item s4" data-tags="photography"
                   data-place="Northcote · 21 Westbourne Grove"
                   data-full="https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=2400&q=90">
            <img src="https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=85" alt="Northcote bedroom" />
            <div className="gallery__item__caption">
              <p className="place">Northcote</p>
              <p className="tags">Photography</p>
            </div>
          </article>

          <article className="gallery__item s4" data-tags="photography floorplan"
                   data-place="Hawthorn · 9 Coppin Grove"
                   data-full="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=2400&q=90">
            <img src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=85" alt="Hawthorn kitchen" />
            <div className="gallery__item__caption">
              <p className="place">Hawthorn</p>
              <p className="tags">Photography · Floor plans</p>
            </div>
          </article>

          <article className="gallery__item s6" data-tags="video staging"
                   data-place="Richmond · 76 Lennox Street"
                   data-full="https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=2400&q=90">
            <img src="https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1600&q=85" alt="Richmond stairwell" />
            <div className="gallery__item__caption">
              <p className="place">Richmond</p>
              <p className="tags">Video · Virtual staging</p>
            </div>
          </article>

          <article className="gallery__item s6" data-tags="photography drone"
                   data-place="South Yarra · 14 Davis Avenue"
                   data-full="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=2400&q=90">
            <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=85" alt="South Yarra house exterior" />
            <div className="gallery__item__caption">
              <p className="place">South Yarra</p>
              <p className="tags">Photography · Drone</p>
            </div>
          </article>

          <article className="gallery__item s4" data-tags="photography"
                   data-place="St Kilda · 8 Fitzroy Street"
                   data-full="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=2400&q=90">
            <img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=85" alt="St Kilda kitchen" />
            <div className="gallery__item__caption">
              <p className="place">St Kilda</p>
              <p className="tags">Photography</p>
            </div>
          </article>

          <article className="gallery__item s4" data-tags="staging photography"
                   data-place="Collingwood · 38 Smith Street"
                   data-full="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=2400&q=90">
            <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=85" alt="Collingwood bedroom" />
            <div className="gallery__item__caption">
              <p className="place">Collingwood</p>
              <p className="tags">Virtual staging · Photography</p>
            </div>
          </article>

          <article className="gallery__item s4" data-tags="floorplan"
                   data-place="Albert Park · 51 Bridport Street"
                   data-full="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=2400&q=90">
            <img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=85" alt="Albert Park kitchen island" />
            <div className="gallery__item__caption">
              <p className="place">Albert Park</p>
              <p className="tags">Floor plans</p>
            </div>
          </article>

          <article className="gallery__item s8" data-tags="video drone"
                   data-place="Williamstown · 2 Esplanade East"
                   data-full="https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=2400&q=90">
            <img src="https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=1600&q=85" alt="Williamstown architecture" />
            <div className="gallery__item__caption">
              <p className="place">Williamstown</p>
              <p className="tags">Video · Drone</p>
            </div>
          </article>

          <article className="gallery__item s4" data-tags="photography"
                   data-place="Elwood · 15 Tennyson Street"
                   data-full="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=2400&q=90">
            <img src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=85" alt="Elwood interior" />
            <div className="gallery__item__caption">
              <p className="place">Elwood</p>
              <p className="tags">Photography</p>
            </div>
          </article>

          <article className="gallery__item s4" data-tags="photography staging"
                   data-place="Prahran · 22 Greville Street"
                   data-full="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=2400&q=90">
            <img src="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1200&q=85" alt="Prahran dining" />
            <div className="gallery__item__caption">
              <p className="place">Prahran</p>
              <p className="tags">Photography · Virtual staging</p>
            </div>
          </article>

          <article className="gallery__item s4" data-tags="drone"
                   data-place="Williamstown North · 7 The Avenue"
                   data-full="https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=2400&q=90">
            <img src="https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=1200&q=85" alt="Aerial home" />
            <div className="gallery__item__caption">
              <p className="place">Williamstown North</p>
              <p className="tags">Drone</p>
            </div>
          </article>

        </div>
      </section>

      {/* CTA STRIP */}
      <section className="section section--ink section--tight" style={{ textAlign: 'center', borderTop: '1px solid rgba(250,250,247,0.08)' }}>
        <div className="section__inner">
          <span className="eyebrow">Book the studio</span>
          <h2 className="h2" style={{ marginTop: 18 }}>Bring your <em>next listing</em> to the practice.</h2>
          <p className="body-copy" style={{ maxWidth: 520, margin: '24px auto 32px', color: 'rgba(250,250,247,0.78)' }}>Half-page brief, one-day response, considered work. Photography, video, drone, floor plans and virtual staging across Melbourne and Victoria.</p>
          <Link href="/book" className="nav__cta" style={{ padding: '16px 32px', fontSize: 12 }}>Book now →</Link>
        </div>
      </section>

      <footer className="foot">
        <div className="foot__inner">
          <div className="foot__top">
            <div>
              <Link href="/#top" aria-label="Won Vision — home"><Wordmark /></Link>
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
    </>
  );
}
