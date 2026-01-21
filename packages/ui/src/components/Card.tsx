import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../lib/utils';
import { fadeIn } from '../animations/variants';

export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  variant?: 'default' | 'glass' | 'bordered' | 'elevated';
  glowEffect?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * Glass morphism Card with cyberpunk styling
 *
 * @example
 * <Card variant="glass" glowEffect>
 *   <h3>Card Title</h3>
 *   <p>Card content</p>
 * </Card>
 *
 * @example
 * <Card
 *   header={<h3>Header</h3>}
 *   footer={<Button>Action</Button>}
 * >
 *   Content
 * </Card>
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      glowEffect = false,
      padding = 'md',
      header,
      footer,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'rounded-xl transition-all duration-300';

    const variants = {
      default: 'bg-surface border border-border',
      glass: 'bg-surface-glass backdrop-blur-xl border border-border/50',
      bordered: 'bg-transparent border-2 border-border-glow',
      elevated: 'bg-surface border border-border shadow-xl',
    };

    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    const glowStyles = glowEffect
      ? 'shadow-glow-md hover:shadow-glow-lg'
      : '';

    return (
      <motion.div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          header || footer ? '' : paddings[padding],
          glowStyles,
          className
        )}
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        {...props}
      >
        {header && (
          <div className={cn('border-b border-border', paddings[padding], 'pb-4')}>
            {header}
          </div>
        )}

        <div className={header || footer ? paddings[padding] : ''}>
          {children}
        </div>

        {footer && (
          <div className={cn('border-t border-border', paddings[padding], 'pt-4')}>
            {footer}
          </div>
        )}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';
