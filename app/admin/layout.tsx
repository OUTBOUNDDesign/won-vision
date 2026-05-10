import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export const metadata = { title: 'Editor admin', robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fafafa', fontFamily: 'var(--font-sora), system-ui, sans-serif' }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 2rem',
        height: '60px',
        borderBottom: '1px solid #e5e5e5',
        background: '#ffffff',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <Link href="/admin/editor" style={{
          fontWeight: 600,
          fontSize: '14px',
          letterSpacing: '0.04em',
          color: '#000',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            background: '#002FA7',
            borderRadius: '4px',
            color: '#fff',
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.05em',
          }}>WV</span>
          Won Vision
          <span style={{ color: '#999', fontWeight: 400 }}>/</span>
          <span style={{ color: '#999', fontWeight: 400 }}>Editor</span>
        </Link>
        <UserButton />
      </header>
      <main style={{ flex: 1, padding: '2.5rem 2rem', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>{children}</main>
    </div>
  );
}
