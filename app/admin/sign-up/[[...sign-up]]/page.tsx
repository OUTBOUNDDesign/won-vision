import { SignUp } from '@clerk/nextjs';

export const metadata = { title: 'Editor sign-up' };

export default function SignUpPage() {
  return (
    <main style={{ display: 'grid', placeItems: 'center', minHeight: '80vh', padding: '2rem' }}>
      <SignUp signInUrl="/admin/sign-in" forceRedirectUrl="/admin" />
    </main>
  );
}
