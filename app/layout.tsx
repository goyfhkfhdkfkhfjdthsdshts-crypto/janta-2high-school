import type {Metadata, Viewport} from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'Janta +2 High School – Khalari',
  description: 'Official mobile-first school app for Janta +2 High School, Khalari. Featuring Secure School Login, AI Class, Live Video Classes, JAC MCQ Practice, Timetable, Study Books, Notices, and Results.',
  openGraph: {
    title: 'Janta +2 High School – Khalari',
    description: 'Official mobile-first school app for Janta +2 High School, Khalari. Featuring Secure School Login, AI Class, Live Video Classes, JAC MCQ Practice, Timetable, Study Books, Notices, and Results.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Janta +2 High School – Khalari',
    description: 'Official mobile-first school app for Janta +2 High School, Khalari.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1e3a8a',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white" suppressHydrationWarning>
        <Script
          src="https://meet.jit.si/external_api.js"
          strategy="lazyOnload"
        />
        {children}
      </body>
    </html>
  );
}
