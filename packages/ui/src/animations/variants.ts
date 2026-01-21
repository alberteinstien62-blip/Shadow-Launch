import { Variants } from 'framer-motion';

/**
 * Fade in animation
 * Usage: <motion.div variants={fadeIn} initial="hidden" animate="visible" />
 */
export const fadeIn: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
};

/**
 * Slide up animation
 * Usage: <motion.div variants={slideUp} initial="hidden" animate="visible" />
 */
export const slideUp: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
};

/**
 * Scale in animation
 * Usage: <motion.div variants={scaleIn} initial="hidden" animate="visible" />
 */
export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.43, 0.13, 0.23, 0.96],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
};

/**
 * Staggered children animation
 * Usage: <motion.div variants={staggerChildren}><motion.div variants={fadeIn} /></motion.div>
 */
export const staggerChildren: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

/**
 * Page transition animation
 * Usage: <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" />
 */
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
};

/**
 * Glow pulse animation
 * Usage: <motion.div variants={glowPulse} animate="pulse" />
 */
export const glowPulse: Variants = {
  pulse: {
    boxShadow: [
      '0 0 20px rgba(168, 85, 247, 0.4)',
      '0 0 30px rgba(168, 85, 247, 0.6)',
      '0 0 20px rgba(168, 85, 247, 0.4)',
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/**
 * Button hover animation
 * Usage: <motion.button whileHover="hover" variants={buttonHover} />
 */
export const buttonHover: Variants = {
  hover: {
    scale: 1.05,
    boxShadow: '0 0 30px rgba(168, 85, 247, 0.5)',
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
    },
  },
};

/**
 * Modal overlay animation
 * Usage: <motion.div variants={modalOverlay} initial="hidden" animate="visible" />
 */
export const modalOverlay: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Modal content animation
 * Usage: <motion.div variants={modalContent} initial="hidden" animate="visible" />
 */
export const modalContent: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.43, 0.13, 0.23, 0.96],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: {
      duration: 0.2,
    },
  },
};
