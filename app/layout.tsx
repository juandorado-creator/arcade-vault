import type { Metadata } from 'next';
import { Press_Start_2P, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Nav from '@/components/Nav';
import { getUser } from '@/lib/supabase/server';
const pressStart2P = Press_Start_2P({
  weight: '400',
  variable: '--font-pixel',
  subsets: ['latin'],
});
const jetbrainsMono = JetBrains_Mono({
  weight: ['400', '500', '700'],
  variable: '--font-mono',
  subsets: ['latin'],
});
export const metadata: Metadata = {
  title: 'Arcade Vault',
  description: 'Online gaming platform — play and compete for points',
};
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();
  console.log('[Supabase] user:', user);
  return (
    <html
      lang="en"
      className={`${pressStart2P.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <Nav />
        {children}
      </body>
    </html>
  );
}
