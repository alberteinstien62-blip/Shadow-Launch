import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../lib/utils';
import { scaleIn } from '../animations/variants';

export interface BadgeProps extends Omit<HTMLMotionProps<'span'>, 'ref'> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'pink';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  pulse?: boolean;
}

/**
 * Status Badge with optional pulsing dot
 *
 * @example
 * <Badge variant="success" dot pulse>
 *   Active
 * </Badge>
 *
 * @example
 * <Badge variant="purple" size="lg">
 *   New Feature
 * </Badge>
 */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'default',
      size = 'md',
      dot = false,
      pulse = false,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center gap-1.5 font-medium rounded-full transition-all duration-200';

    const variants = {
      default: 'bg-surface text-text-secondary border border-border',
      success: 'bg-green-500/20 text-green-400 border border-green-500/50',
      warning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50',
      danger: 'bg-red-500/20 text-red-400 border border-red-500/50',
      info: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50',
      purple: 'bg-purple-500/20 text-purple-400 border border-purple-500/50',
      pink: 'bg-pink-500/20 text-pink-400 border border-pink-500/50',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-1.5 text-base',
    };

    const dotSizes = {
      sm: 'w-1.5 h-1.5',
      md: 'w-2 h-2',
      lg: 'w-2.5 h-2.5',
    };

    const dotColors = {
      default: 'bg-text-secondary',
      success: 'bg-green-400',
      warning: 'bg-yellow-400',
      danger: 'bg-red-400',
      info: 'bg-cyan-400',
      purple: 'bg-purple-400',
      pink: 'bg-pink-400',
    };

    return (
      <motion.span
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        variants={scaleIn}
        initial="hidden"
        animate="visible"
        {...props}
      >
        {dot && (
          <span className="relative inline-flex">
            <span
              className={cn(
                'rounded-full',
                dotSizes[size],
                dotColors[variant]
              )}
            />
            {pulse && (
              <span
                className={cn(
                  'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
                  dotColors[variant]
                )}
              />
            )}
          </span>
        )}
        {children}
      </motion.span>
    );
  }
);

Badge.displayName = 'Badge';
