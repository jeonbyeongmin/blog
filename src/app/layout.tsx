import type { Metadata } from 'next';
import { Noto_Serif_KR } from 'next/font/google';

import Sidebar from '@/app/_components/sidebar';
import { cn } from '@/lib/utils';

import './globals.css';

const notoSerif = Noto_Serif_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: 'monolog',
    template: '%s | monolog',
  },
  description: '내가 올리고 싶은 글을 올리는 블로그',
  keywords: [
    '블로그',
    '개인 블로그',
    '기술 블로그',
    '개발 블로그',
    '프로그래밍',
    '코딩',
  ],
  authors: [{ name: 'monolog' }],
  creator: 'monolog',
  publisher: 'monolog',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://monolog.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'monolog',
    description: '내가 올리고 싶은 글을 올리는 블로그',
    url: 'https://monolog.vercel.app',
    siteName: 'monolog',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'monolog',
    description: '내가 올리고 싶은 글을 올리는 블로그',
    creator: '@monolog',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = ['weekly-magazine', 'movies', 'books', 'dev-log'];
  return (
    <html lang="ko" className="dark">
      <body
        className={cn(
          notoSerif.className,
          'mx-auto min-h-screen max-w-screen-lg bg-zinc-950 text-white'
        )}
      >
        <div className="flex justify-center">
          <Sidebar categories={categories} />
          {children}
        </div>
      </body>
    </html>
  );
}
