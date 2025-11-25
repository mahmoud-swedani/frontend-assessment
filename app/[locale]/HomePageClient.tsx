'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Users, Search, Filter, Table2, Grid3x3 } from 'lucide-react';
import { pageTransition, staggerContainer, staggerItem, slideUp, hoverScale, floating, SPRING, cardSpring } from '@/lib/animations';
import { TextReveal } from '@/components/ui/text-reveal';

export function HomePageClient() {
  const t = useTranslations('home');
  const featuresRef = useRef(null);
  const isFeaturesInView = useInView(featuresRef, { once: true, margin: '-50px' });

  const features = [
    {
      icon: Search,
      title: t('features.search.title'),
      description: t('features.search.description'),
    },
    {
      icon: Filter,
      title: t('features.filter.title'),
      description: t('features.filter.description'),
    },
    {
      icon: Table2,
      title: t('features.views.title'),
      description: t('features.views.description'),
    },
  ];

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={pageTransition}
      className="container mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      {/* Hero Section */}
      <motion.div
        variants={staggerContainer}
        className="text-center space-y-8 mb-20 relative py-12"
      >
        {/* Elegant gradient background */}
        <div className="absolute inset-0 gradient-mesh opacity-60 -z-10 rounded-3xl blur-3xl" />
        <div className="absolute inset-0 bg-gradient-rose-lavender opacity-5 -z-10 rounded-3xl" />
        
        <TextReveal
          text={t('hero.title')}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight gradient-text-rose mb-4"
          delay={0.1}
          duration={0.6}
        />
        
        <TextReveal
          text={t('hero.description')}
          className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          delay={0.3}
          duration={0.5}
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

      {/* Features Grid with scroll trigger */}
      <motion.section
        ref={featuresRef}
        initial="hidden"
        animate={isFeaturesInView ? 'visible' : 'hidden'}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
              delayChildren: 0.2
            }
          }
        }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
      >
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={index}
              variants={{
                hidden: { 
                  opacity: 0, 
                  y: 40, 
                  scale: 0.95,
                  rotateX: -15
                },
                visible: { 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  rotateX: 0,
                  transition: {
                    type: 'spring',
                    stiffness: 100,
                    damping: 20,
                    delay: index * 0.1
                  }
                }
              }}
              style={{ perspective: 1000 }}
              {...cardSpring}
              className="group relative p-8 border-2 border-primary/10 rounded-2xl bg-card hover:shadow-large hover:border-primary/20 transition-all duration-300 overflow-hidden"
            >
              {/* Soft pink/lavender gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
              
              <div className="relative z-10" style={{ transform: 'translateZ(50px)' }}>
                <div className="flex items-center gap-4 mb-5">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.15 }}
                    transition={SPRING.elegant}
                    className="p-3 bg-gradient-rose-lavender/10 rounded-xl group-hover:bg-gradient-rose-lavender/20 transition-all duration-300 shadow-soft group-hover:shadow-rose"
                  >
                    <Icon className="h-6 w-6 text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-semibold gradient-text-rose">{feature.title}</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed text-base">{feature.description}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.section>

      {/* Quick Access */}
      <motion.div
        variants={slideUp}
        className="text-center"
      >
        <motion.div
          whileHover={hoverScale}
          whileTap={{ scale: 0.98 }}
          transition={SPRING.gentle}
        >
          <Button asChild variant="outline" size="lg" className="gap-2 shadow-soft hover:shadow-rose">
            <Link href="/team-directory">
              <Grid3x3 className="h-5 w-5" />
              {t('quickAccess')}
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

