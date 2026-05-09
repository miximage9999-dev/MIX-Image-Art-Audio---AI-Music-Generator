import type {Metadata} from 'next';
import { Inter, Sarabun } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const sarabun = Sarabun({ weight: ['300', '400', '500', '600', '700'], subsets: ['thai', 'latin'], variable: '--font-sarabun' });

export const metadata: Metadata = {
  title: 'MIX Image Art & Audio',
  description: 'AI Music Generator based on TikTok Trends & Suno Pro',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${sarabun.variable} dark`} suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
