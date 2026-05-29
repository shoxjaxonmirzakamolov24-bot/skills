import './globals.css';
import Script from 'next/script';

export const metadata = {
  title: 'SkillSwap — Ko\'nikma almashinuv',
  description: 'Pulsiz ko\'nikma almashinuv platformasi',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="uz">
      <body>
        {/* Telegram Mini App SDK — bizning kodimizdan oldin yuklanishi shart */}
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  );
}
