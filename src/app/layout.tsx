import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://bidlevel.app'),
  title: 'Bid Level — IFC takeoff in your browser',
  description: 'Drop a BIM model. Get a bid-ready takeoff in 60 seconds. Built for SMB contractors. No Revit. No Navisworks. No install.',
  openGraph: {
    title: 'Bid Level — IFC takeoff in your browser',
    description: 'IFC-native takeoff. Click any line item — see it light up in 3D.',
    url: 'https://bidlevel.app',
    siteName: 'Bid Level',
    images: ['/og.png'],
  },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
