import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  inputSize?: 'sm' | 'md' | 'lg';
}

/**
 * Cyberpunk-styled Input with glow effects
 *
 * @example
 * <Input
 *   label="Email"
 *   placeholder="Enter your email"
 *   type="email"
 * />
 *
 * @example
 * <Input
 *   label="Amount"
 *   error="Invalid amount"
 *   leftIcon={<DollarIcon />}
 *   rightIcon={<MaxButton />}
 * />
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      inputSize = 'md',
      className,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'w-full bg-surface border rounded-lg transition-all duration-200 text-text-primary placeholder:text-text-muted focus:outline-none';

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-5 py-3 text-lg',
    };

    const borderStyles = error
      ? 'border-red-500 focus:border-red-500 focus:shadow-glow-pink'
      : 'border-border focus:border-border-glow focus:shadow-glow-sm';

    const iconPadding = {
      left: leftIcon ? 'pl-10' : '',
      right: rightIcon ? 'pr-10' : '',
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text-secondary mb-2">
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              {leftIcon}
            </div>
          )}

          <motion.input
            ref={ref}
            className={cn(
              baseStyles,
              sizeStyles[inputSize],
              borderStyles,
              iconPadding.left,
              iconPadding.right,
              className
            )}
            whileFocus={{
              scale: 1.01,
              transition: { duration: 0.2 },
            }}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1.5 text-sm text-red-400"
          >
            {error}
          </motion.p>
        )}

        {helperText && !error && (
          <p className="mt-1.5 text-sm text-text-muted">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
