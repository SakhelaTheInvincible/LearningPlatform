import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ConditionalHeader from '../components/ConditionalHeader';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI-Powered Learning Platform',
  description: 'Enhance your computer science education through personalized, adaptive learning experiences.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} page-transition`}>
        <div className="min-h-screen">
          <ConditionalHeader />
          {children}
        </div>
      </body>
    </html>
  );
} 