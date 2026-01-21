import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClientLayout } from '@/components/ClientLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ShadowLaunch | Private Token Launchpad on Aleo',
  description: 'Fair launches. No snipers. No bots. Launch tokens with sealed-bid privacy on Aleo.',
  keywords: ['Aleo', 'token launch', 'private', 'fair launch', 'sealed bid', 'crypto'],
  openGraph: {
    title: 'ShadowLaunch - Private Token Launchpad',
    description: 'Fair launches. No snipers. No bots.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Orbitron:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} bg-cyber-black text-white min-h-screen`}>
        <div className="fixed inset-0 bg-cyber-grid bg-grid opacity-30 pointer-events-none" />
        <div className="fixed inset-0 bg-gradient-radial from-neon-greenGlow via-transparent to-transparent opacity-20 pointer-events-none" />
        <main className="relative z-10">
          <ClientLayout>
            {children}
          </ClientLayout>
        </main>
      </body>
    </html>
  );
}
