'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { pageTransition, staggerContainer, slideUp, hoverScale, floating, SPRING } from '@/lib/animations';
import { TextReveal } from '@/components/ui/text-reveal';

export function HomePageClient() {
  const t = useTranslations('home');

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={pageTransition}
      className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10"
    >
      {/* Hero Section */}
      <motion.div
        variants={staggerContainer}
        className="text-center space-y-8 relative py-12 bg-background rounded-3xl"
      >
        {/* Elegant gradient background */}
        <div className="absolute inset-0 gradient-mesh opacity-60 -z-10 rounded-3xl blur-3xl" />
        <div className="absolute inset-0 bg-gradient-rose-lavender opacity-5 -z-10 rounded-3xl" />
        
        <TextReveal
          text={t('hero.title')}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight gradient-text-rose mb-4"
          delay={0.1}
          duration={0.6}
          animateOnMount={true}
        />
        
        <TextReveal
          text={t('hero.description')}
          className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          delay={0.3}
          duration={0.5}
          animateOnMount={true}
        />
        
        <motion.div
          variants={slideUp}
          className="flex justify-center gap-4 pt-4"
        >
          <motion.div
            whileHover={hoverScale}
            whileTap={{ scale: 0.98 }}
            transition={SPRING.gentle}
          >
            <Button asChild size="lg" className="gap-2 relative overflow-hidden group shadow-rose">
              <Link href="/team-directory">
                <motion.div
                  variants={floating}
                  animate="animate"
                >
                  <Users className="h-5 w-5" />
                </motion.div>
                {t('hero.cta')}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

