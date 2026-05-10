import { SignIn } from '@clerk/nextjs';

export const metadata = { title: 'Editor sign-in' };

export default function SignInPage() {
  return (
    <main style={{ display: 'grid', placeItems: 'center', minHeight: '80vh', padding: '2rem' }}>
      <SignIn signUpUrl="/admin/sign-up" forceRedirectUrl="/admin" />
    </main>
  );
}
