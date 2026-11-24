'use client';

import type { ReactNode } from 'react';
import { motion, useReducedMotion, type Variants } from 'motion/react';

const EASE_OUT_QUART = [0.22, 1, 0.36, 1] as const;

interface RevealSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  immediate?: boolean;
  once?: boolean;
  as?: 'section' | 'div' | 'footer' | 'header';
}

export function RevealSection({
  children,
  className,
  delay = 0,
  immediate = false,
  once = false,
  as = 'section',
}: RevealSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const offset = prefersReducedMotion ? 0 : 10;

  const Component =
    as === 'footer'
      ? motion.footer
      : as === 'header'
        ? motion.header
        : as === 'div'
          ? motion.div
          : motion.section;

  if (immediate) {
    return (
      <Component
        initial={{ opacity: 0, y: offset }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: prefersReducedMotion ? 0.15 : 0.36,
          delay,
          ease: EASE_OUT_QUART,
        }}
        className={className}
      >
        {children}
      </Component>
    );
  }

  return (
    <Component
      initial={{ opacity: 0, y: offset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 'some', margin: '0px 0px -24px 0px' }}
      transition={{
        duration: prefersReducedMotion ? 0.15 : 0.38,
        delay,
        ease: EASE_OUT_QUART,
      }}
      className={className}
    >
      {children}
    </Component>
  );
}

interface RevealCardProps {
  children: ReactNode;
  className?: string;
  once?: boolean;
}

export function RevealCard({
  children,
  className,
  once = false,
}: RevealCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const offset = prefersReducedMotion ? 0 : 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: offset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 'some', margin: '0px 0px -40px 0px' }}
      transition={{
        duration: prefersReducedMotion ? 0.15 : 0.35,
        ease: EASE_OUT_QUART,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface RevealGroupProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
  once?: boolean;
}

export function RevealGroup({
  children,
  className,
  stagger = 0.08,
  once = false,
}: RevealGroupProps) {
  const prefersReducedMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.04,
        staggerDirection: -1,
      },
    },
    visible: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : stagger,
        delayChildren: prefersReducedMotion ? 0 : 0.03,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 'some', margin: '0px 0px -36px 0px' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface RevealItemProps {
  children: ReactNode;
  className?: string;
  variant?: 'slide' | 'pop';
}

export function RevealItem({
  children,
  className,
  variant = 'slide',
}: RevealItemProps) {
  const prefersReducedMotion = useReducedMotion();

  const itemVariants: Variants =
    variant === 'pop'
      ? {
          hidden: {
            opacity: 0,
            y: prefersReducedMotion ? 0 : 14,
            scale: prefersReducedMotion ? 1 : 0.94,
          },
          visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: prefersReducedMotion
              ? { duration: 0.15 }
              : {
                  type: 'spring',
                  stiffness: 360,
                  damping: 24,
                },
          },
        }
      : {
          hidden: {
            opacity: 0,
            y: prefersReducedMotion ? 0 : 10,
          },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              duration: prefersReducedMotion ? 0.15 : 0.36,
              ease: EASE_OUT_QUART,
            },
          },
        };

  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}
