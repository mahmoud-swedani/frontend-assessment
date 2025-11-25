'use client';

import { useState, useEffect, useTransition } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function LanguageSelector() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLanguageChange = (newLocale: string) => {
    if (newLocale === locale || isPending) return;
    
    startTransition(() => {
      try {
        router.push(pathname, { locale: newLocale });
      } catch (error) {
        console.error('Language change error:', error);
        // Fallback to window.location if router fails
        const newPath = `/${newLocale}${pathname === '/' ? '' : pathname}`;
        window.location.href = newPath;
      }
    });
  };

  const defaultLanguage = { value: 'en', label: 'English', flag: '🇬🇧' };
  const languages = [
    defaultLanguage,
    { value: 'ar', label: 'العربية', flag: '🇸🇦' },
  ];

  const currentLanguage = languages.find((lang) => lang.value === locale) ?? defaultLanguage;

  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        <Globe className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" aria-hidden="true" />
        <div className="w-[100px] sm:w-[120px] h-8 sm:h-9 rounded-lg sm:rounded-xl border-2 border-input/50 bg-background px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm flex items-center justify-center shadow-soft">
          <span className="text-muted-foreground">{currentLanguage.label}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <Globe className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" aria-hidden="true" />
      <div className="relative inline-flex rounded-lg sm:rounded-xl border-2 border-primary/10 bg-background shadow-soft" role="group">
        {languages.map((lang, index) => (
          <Button
            key={lang.value}
            variant="ghost"
            size="sm"
            onClick={() => handleLanguageChange(lang.value)}
            disabled={isPending || locale === lang.value}
            className={cn(
              'h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm transition-all duration-300',
              index === 0 && 'rounded-r-none',
              index === languages.length - 1 && 'rounded-l-none border-l-0',
              locale === lang.value && 'bg-gradient-rose-lavender/10 text-primary font-semibold shadow-soft',
              isPending && 'opacity-50 cursor-not-allowed'
            )}
            aria-label={`Switch to ${lang.label}`}
          >
            <span className="flex items-center gap-1 sm:gap-1.5">
              <span className="text-base sm:text-lg">{lang.flag}</span>
              <span className="hidden sm:inline">{lang.label}</span>
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}

