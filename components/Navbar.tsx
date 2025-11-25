'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/routing';
import { Link } from '@/i18n/routing';
import { Users, Menu, X } from 'lucide-react';
import { LanguageSelector } from '@/components/LanguageSelector';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, hoverScale, delicatePulse, SPRING, modalBackdrop } from '@/lib/animations';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

export function Navbar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/team-directory', label: t('teamDirectory') },
  ];

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const mobileMenuVariants = prefersReducedMotion ? undefined : {
    hidden: { opacity: 0, x: '100%' },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 30,
      },
    },
    exit: {
      opacity: 0,
      x: '100%',
      transition: {
        duration: 0.2,
      },
    },
  } as const;

  return (
    <>
      <motion.nav
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="sticky top-0 z-50 w-full border-b-2 backdrop-blur-md supports-[backdrop-filter]:backdrop-blur-md glass"
        style={{
          background: 'linear-gradient(135deg, oklch(0.99 0.005 15 / 0.85) 0%, oklch(0.995 0.003 15 / 0.9) 100%)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          borderColor: 'oklch(0.7 0.12 15 / 0.2)',
          boxShadow: '0 4px 20px oklch(0.7 0.12 15 / 0.08)',
        }}
      >
        <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo/Brand */}
          <motion.div
            whileHover={prefersReducedMotion ? {} : hoverScale}
            whileTap={{ scale: 0.98 }}
            transition={SPRING.gentle}
            className="flex-shrink-0"
          >
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold text-base sm:text-lg transition-all duration-300 hover:text-primary group"
            >
              <motion.div
                variants={prefersReducedMotion ? {} : delicatePulse}
                animate={prefersReducedMotion ? {} : "animate"}
                className="relative"
              >
                <Users className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" aria-hidden="true" />
              </motion.div>
              <span className="relative gradient-text-rose hidden sm:inline">
                {t('brand')}
                <motion.span
                  className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-rose-lavender rounded-full group-hover:w-full transition-all duration-500"
                  initial={false}
                />
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <motion.div
                  key={link.href}
                  whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  transition={SPRING.gentle}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      'relative text-sm font-medium transition-all duration-300 px-3 py-1.5 rounded-lg',
                      isActive
                        ? 'text-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {link.label}
                    {isActive && (
                      <motion.span
                        layoutId="navbar-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-rose-lavender rounded-full shadow-rose"
                        initial={false}
                        transition={SPRING.elegant}
                      />
                    )}
                    {!isActive && !prefersReducedMotion && (
                      <motion.span
                        className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-rose-lavender rounded-full -translate-x-1/2"
                        initial={false}
                        whileHover={{ width: '75%' }}
                        transition={SPRING.smooth}
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}

            {/* Language Selector - Desktop */}
            <LanguageSelector />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <LanguageSelector />
            <motion.button
              whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg text-foreground hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={isMobileMenuOpen ? t('closeMenu') || 'Close menu' : t('openMenu') || 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-5 w-5" aria-hidden="true" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-md z-[60] md:hidden"
              onClick={toggleMobileMenu}
              aria-hidden="true"
            />
            
            {/* Mobile Menu */}
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={mobileMenuVariants}
              className="fixed end-0 top-0 h-full w-full max-w-sm bg-card border-s-2 border-primary/10 shadow-large z-[70] md:hidden overflow-y-auto"
              role="dialog"
              aria-modal="true"
              aria-label={t('menu') || 'Menu'}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col h-full">
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between p-6 border-b border-primary/10">
                  <h2 className="text-xl font-semibold">{t('menu') || 'Menu'}</h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleMobileMenu}
                    className="p-2 rounded-lg hover:bg-accent transition-colors"
                    aria-label={t('closeMenu') || 'Close menu'}
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </motion.button>
                </div>

                {/* Mobile Navigation Links */}
                <nav className="flex-1 p-6 space-y-2" aria-label="Main navigation">
                  {navLinks.map((link, index) => {
                    const isActive = pathname === link.href;
                    return (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link
                          href={link.href}
                          onClick={toggleMobileMenu}
                          className={cn(
                            'flex items-center px-4 py-3 rounded-xl text-base font-medium transition-all duration-300',
                            isActive
                              ? 'bg-gradient-rose-lavender/10 text-foreground border-2 border-primary/20 shadow-soft'
                              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                          )}
                        >
                          {link.label}
                          {isActive && (
                            <motion.div
                              layoutId="mobile-navbar-indicator"
                              className="ms-auto w-2 h-2 rounded-full bg-gradient-rose-lavender"
                              initial={false}
                              transition={SPRING.elegant}
                            />
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>

                {/* Mobile Menu Footer */}
                <div className="p-6 border-t border-primary/10">
                  <div className="text-sm text-muted-foreground mb-3">
                    {t('language') || 'Language'}
                  </div>
                  <LanguageSelector />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

