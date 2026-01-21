import React from 'react';
import { Shield, ShieldCheck, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { scaleIn } from '../animations/variants';

export interface PrivacyBadgeProps {
  level?: 'none' | 'low' | 'medium' | 'high' | 'maximum';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Privacy level indicator badge with shield icon
 *
 * @example
 * <PrivacyBadge level="high" showLabel />
 *
 * @example
 * <PrivacyBadge level="maximum" size="lg" />
 */
export const PrivacyBadge: React.FC<PrivacyBadgeProps> = ({
  level = 'high',
  showLabel = false,
  size = 'md',
  className,
}) => {
  const config = {
    none: {
      icon: ShieldAlert,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/50',
      label: 'No Privacy',
      glow: 'shadow-glow-pink',
    },
    low: {
      icon: Shield,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/50',
      label: 'Low Privacy',
      glow: 'shadow-glow-sm',
    },
    medium: {
      icon: Shield,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20',
      borderColor: 'border-cyan-500/50',
      label: 'Medium Privacy',
      glow: 'shadow-glow-cyan',
    },
    high: {
      icon: ShieldCheck,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/50',
      label: 'High Privacy',
      glow: 'shadow-glow-green',
    },
    maximum: {
      icon: ShieldCheck,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500/50',
      label: 'Maximum Privacy',
      glow: 'shadow-glow-md',
    },
  };

  const sizes = {
    sm: {
      container: 'px-2 py-1 text-xs gap-1',
      icon: 'w-3 h-3',
    },
    md: {
      container: 'px-3 py-1.5 text-sm gap-1.5',
      icon: 'w-4 h-4',
    },
    lg: {
      container: 'px-4 py-2 text-base gap-2',
      icon: 'w-5 h-5',
    },
  };

  const { icon: Icon, color, bgColor, borderColor, label, glow } = config[level];

  return (
    <motion.div
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        sizes[size].container,
        bgColor,
        borderColor,
        color,
        glow,
        className
      )}
      variants={scaleIn}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <Icon className={sizes[size].icon} />
      </motion.div>
      {showLabel && <span>{label}</span>}
    </motion.div>
  );
};

PrivacyBadge.displayName = 'PrivacyBadge';
