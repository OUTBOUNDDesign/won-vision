import { Sora } from 'next/font/google';

// Sora — single variable family for the brand. Weight 500 carries the
// headings and logo lockup; weight 400 carries body copy.
export const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-sora',
  display: 'swap',
});
