import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { ApolloProvider } from '@/components/providers/ApolloProvider';
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider';
import { Navbar } from '@/components/Navbar';
import { LocaleAttributes } from '@/components/LocaleAttributes';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  // Always render Apollo Provider so useQuery hooks work even when skipped
  return (
    <NextIntlClientProvider messages={messages}>
      <LocaleAttributes />
      <ApolloProvider>
        <SmoothScrollProvider>
          <Navbar />
          <main className="flex flex-col h-[calc(100vh-var(--navbar-height))] overflow-y-auto">
            {children}
          </main>
        </SmoothScrollProvider>
      </ApolloProvider>
    </NextIntlClientProvider>
  );
}

