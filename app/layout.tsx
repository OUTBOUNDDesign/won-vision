import type { Metadata } from 'next';
import './globals.css';
import Script from 'next/script';

export const metadata: Metadata = {
  metadataBase: new URL('https://wonvision.com.au'),
  title: { default: 'Won Vision', template: '%s — Won Vision' },
  description: 'Melbourne real estate photography by Won Vision.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body id="top">
        {children}
        <Script src="/script.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
