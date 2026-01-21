import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  showPercentage?: boolean;
  label?: string;
  variant?: 'default' | 'gradient' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

/**
 * Animated progress bar with gradient fill
 *
 * @example
 * <ProgressBar
 *   value={75}
 *   label="Upload Progress"
 *   showPercentage
 *   variant="gradient"
 * />
 *
 * @example
 * <ProgressBar value={50} max={100} animated />
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  showLabel = false,
  showPercentage = false,
  label,
  variant = 'default',
  size = 'md',
  animated = true,
  className,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const variants = {
    default: 'bg-accent-purple',
    gradient: 'bg-gradient-primary',
    success: 'bg-gradient-success',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
  };

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const glowColors = {
    default: 'shadow-glow-md',
    gradient: 'shadow-glow-md',
    success: 'shadow-glow-green',
    warning: 'shadow-glow-sm',
    danger: 'shadow-glow-pink',
  };

  return (
    <div className={cn('w-full', className)}>
      {(showLabel || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {showLabel && label && (
            <span className="text-sm font-medium text-text-secondary">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm font-medium text-text-primary tabular-nums">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      <div
        className={cn(
          'w-full bg-surface rounded-full overflow-hidden border border-border',
          sizes[size]
        )}
      >
        <motion.div
          className={cn(
            'h-full rounded-full',
            variants[variant],
            glowColors[variant]
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: animated ? 0.5 : 0,
            ease: 'easeOut',
          }}
        >
          {animated && (
            <motion.div
              className="h-full w-full"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              }}
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

ProgressBar.displayName = 'ProgressBar';
