import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { HomePageClient } from './HomePageClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home.metadata' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return <HomePageClient />;
}

