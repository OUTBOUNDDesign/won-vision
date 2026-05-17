import type { Metadata } from 'next';
import './globals.css';
import Script from 'next/script';
import { ClerkProvider } from '@clerk/nextjs';
import { sora } from './fonts';

export const metadata: Metadata = {
  metadataBase: new URL('https://wonvision.com.au'),
  title: { default: 'Won Vision', template: '%s — Won Vision' },
  description: 'Melbourne real estate photography by Won Vision.',
  // app/icon.svg is auto-served by Next via the file convention; explicit
  // metadata.icons removed so the new W+V mark wins over the legacy .ico.
};

// Google Analytics 4 — Won Vision Website property (created 2026-05-08).
// Loaded via next/script with afterInteractive so it doesn't block first
// paint. The OUTBOUND ops dashboard reads from this property.
const GA4_MEASUREMENT_ID = "G-MHFPGW1T7F";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={sora.variable}>
        <body id="top">
          {/* Runs before paint: if the intro loader will show this session,
              flag <html> so the hero morph holds "Won Vision" opaque for the
              loader's duration (one-time start offset, loop unchanged). */}
          <Script id="wv-loader-class" strategy="beforeInteractive">{`
try{if(sessionStorage.getItem('wv-entered')!=='1'){document.documentElement.classList.add('wv-loader-active')}}catch(e){}
`}</Script>
          {children}
          <Script src="/script.js" strategy="afterInteractive" />
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA4_MEASUREMENT_ID}', { send_page_view: true });
            `}
          </Script>
        </body>
      </html>
    </ClerkProvider>
  );
}
