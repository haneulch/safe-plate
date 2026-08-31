import type { Metadata, Viewport } from 'next';
import { Gowun_Batang, IBM_Plex_Sans_KR } from 'next/font/google';
import { cookies } from 'next/headers';
import './globals.css';
import { LANG_COOKIE, dirFor, isUiLang } from '@/lib/i18n';
import ProfileSync from '@/components/ProfileSync';

const fontUi = IBM_Plex_Sans_KR({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-ui',
  display: 'swap',
});

const fontDisplay = Gowun_Batang({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SafePlate Korea',
  description: 'Eat safely in Korea — dietary screening & care card for travelers',
  appleWebApp: { capable: true, title: 'SafePlate', statusBarStyle: 'default' },
  icons: { apple: '/icons/icon-192.png' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#15803d',
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieLang = (await cookies()).get(LANG_COOKIE)?.value;
  const lang = isUiLang(cookieLang) ? cookieLang : 'en';
  return (
    <html lang={lang} dir={dirFor(lang)} className={`${fontUi.variable} ${fontDisplay.variable}`}>
      <body>
        <ProfileSync />
        <div className="phone">{children}</div>
      </body>
    </html>
  );
}
