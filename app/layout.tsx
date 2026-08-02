import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/Toaster';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

export const metadata: Metadata = {
  title: {
    default: 'Sims Academy - Online Learning Platform',
    template: '%s | Sims Academy',
  },
  description: 'Learn from the best tutors. Join Sims Academy for quality online education.',
  keywords: ['education', 'online learning', 'courses', 'tutors', 'certificates'],
  authors: [{ name: 'Seedwel Investment Limited' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://sims-academy.vercel.app',
    siteName: 'Sims Academy',
    title: 'Sims Academy - Online Learning Platform',
    description: 'Learn from the best tutors. Join Sims Academy for quality online education.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sims Academy - Online Learning Platform',
    description: 'Learn from the best tutors. Join Sims Academy for quality online education.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
