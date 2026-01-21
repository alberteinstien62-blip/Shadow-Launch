import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'gradient' | 'dots';
  className?: string;
}

/**
 * Animated loading spinner with cyberpunk styling
 *
 * @example
 * <LoadingSpinner size="md" variant="gradient" />
 *
 * @example
 * <LoadingSpinner size="lg" variant="dots" />
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  className,
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  if (variant === 'dots') {
    const dotSizes = {
      sm: 'w-1.5 h-1.5',
      md: 'w-2.5 h-2.5',
      lg: 'w-3.5 h-3.5',
      xl: 'w-4 h-4',
    };

    return (
      <div className={cn('flex gap-2', className)}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={cn(
              'rounded-full bg-gradient-primary',
              dotSizes[size]
            )}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'gradient') {
    return (
      <motion.div
        className={cn('relative', sizes[size], className)}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-primary opacity-20" />
        <div className="absolute inset-0 rounded-full bg-gradient-primary"
          style={{
            clipPath: 'polygon(50% 0%, 100% 0%, 100% 50%, 50% 50%)',
          }}
        />
        <div className="absolute inset-1 rounded-full bg-background" />
      </motion.div>
    );
  }

  // Default spinner
  return (
    <motion.div
      className={cn('relative', sizes[size], className)}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      <svg
        className="w-full h-full"
        viewBox="0 0 50 50"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="stroke-surface"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth="5"
        />
        <motion.circle
          className="stroke-accent-purple"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="80, 200"
          strokeDashoffset="0"
          animate={{
            strokeDashoffset: [0, -125],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </svg>
    </motion.div>
  );
};

LoadingSpinner.displayName = 'LoadingSpinner';
