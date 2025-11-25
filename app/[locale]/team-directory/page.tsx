import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { TeamDirectoryClient } from './TeamDirectoryClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'teamDirectory.metadata' });

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
    },
  };
}

export default async function TeamDirectoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return (
    <ErrorBoundary>
      <div className="h-[calc(100vh-var(--navbar-height))]">
        <TeamDirectoryClient />
      </div>
    </ErrorBoundary>
  );
}

