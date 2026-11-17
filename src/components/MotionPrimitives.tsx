import type { ReactNode } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';

export const INSTITUTIONAL_EASE = [0.16, 1, 0.3, 1] as const;

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  yOffset?: number;
}

/**
 * Immediate entrance animation when the website/page loads.
 * Uses GPU-composited opacity + transform only.
 */
export function RevealOnLoad({
  children,
  className,
  delay = 0,
  yOffset = 14,
}: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.48, delay, ease: INSTITUTIONAL_EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Scroll-triggered reveal animation as the user scrolls down the page.
 * Uses a forgiving `amount: 0.06` threshold so tall blocks on mobile never remain hidden.
 */
export function RevealOnScroll({
  children,
  className,
  delay = 0,
  yOffset = 20,
}: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.06 }}
      transition={{ duration: 0.5, delay, ease: INSTITUTIONAL_EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const staggerContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.04,
    },
  },
};

const staggerItemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.42,
      ease: INSTITUTIONAL_EASE,
    },
  },
};

interface StaggerGridProps {
  children: ReactNode;
  className?: string;
}

export function StaggerRevealGrid({ children, className }: StaggerGridProps) {
  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.05 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerRevealItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={staggerItemVariants} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * Razor-thin scroll reading indicator pinned to the top viewport edge.
 * Animates exclusively via scaleX transform.
 */
export function ScrollProgressRule() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 32,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="pointer-events-none fixed top-0 left-0 right-0 z-50 h-[2.5px] origin-left bg-gradient-to-r from-[#14452F] via-[#C2820A] to-[#0B3B69]"
    />
  );
}
