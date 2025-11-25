import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ApolloProvider } from '@/components/providers/ApolloProvider';
import { NextIntlClientProvider } from 'next-intl';
import enMessages from '@/messages/en.json';

interface AllTheProvidersProps {
  children: React.ReactNode;
  locale?: string;
  messages?: Record<string, any>;
}

function AllTheProviders({
  children,
  locale = 'en',
  messages = enMessages,
}: AllTheProvidersProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ApolloProvider>{children}</ApolloProvider>
    </NextIntlClientProvider>
  );
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  locale?: string;
  messages?: Record<string, any>;
}

const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { locale, messages, ...renderOptions } = options;

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AllTheProviders locale={locale} messages={messages}>
      {children}
    </AllTheProviders>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

export * from '@testing-library/react';
export { customRender as render };

