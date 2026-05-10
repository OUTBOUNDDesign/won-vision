import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export const metadata = { title: 'Editor admin — Won Vision', robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#F5F5F5',
      fontFamily: 'var(--font-sora), system-ui, sans-serif',
    }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 2rem',
        height: '56px',
        borderBottom: '1px solid #E5E5E5',
        background: '#fff',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <Link href="/admin/editor" style={{
          fontWeight: 500,
          fontSize: '13px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#000',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textDecoration: 'none',
        }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            background: '#000',
            color: '#fff',
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            flexShrink: 0,
          }}>WV</span>
          Won Vision
          <span style={{ color: '#737373', fontWeight: 400 }}>/</span>
          <span style={{ color: '#737373', fontWeight: 400, letterSpacing: '0.12em' }}>Editor</span>
        </Link>
        <UserButton />
      </header>
      <main style={{ flex: 1, padding: '2.5rem 2rem', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
        {children}
      </main>
    </div>
  );
}
