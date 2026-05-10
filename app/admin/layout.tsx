import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export const metadata = { title: 'Editor admin', robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        borderBottom: '1px solid #2a2a2a',
      }}>
        <Link href="/admin" style={{ fontWeight: 600 }}>Won Vision · Editor</Link>
        <UserButton />
      </header>
      <main style={{ flex: 1, padding: '2rem' }}>{children}</main>
    </div>
  );
}
