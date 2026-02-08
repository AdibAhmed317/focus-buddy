import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';

const nunito = Nunito({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Focus Buddy - Gentle reminders to refocus',
  description:
    'Focus Buddy plays soft, random sounds to nudge you back on task without breaking your flow.',
  openGraph: {
    title: 'Focus Buddy - Gentle reminders to refocus',
    description:
      'Focus Buddy plays soft, random sounds to nudge you back on task without breaking your flow.',
    url: 'https://focusbuddy.app',
    siteName: 'Focus Buddy',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Focus Buddy',
    description: 'Gentle reminders to bring you back to focus.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={nunito.className}>{children}</body>
    </html>
  );
}
