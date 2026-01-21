import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { scaleIn } from '../animations/variants';

export interface CountdownTimerProps {
  targetDate: Date | number;
  onComplete?: () => void;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * Countdown timer for launch phases
 *
 * @example
 * <CountdownTimer
 *   targetDate={new Date('2024-12-31')}
 *   onComplete={handleLaunch}
 *   showLabels
 * />
 */
export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  onComplete,
  showLabels = true,
  size = 'md',
  className,
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  function calculateTimeLeft(): TimeLeft {
    const target = typeof targetDate === 'number' ? targetDate : targetDate.getTime();
    const difference = target - Date.now();

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      // Check if countdown is complete
      if (
        newTimeLeft.days === 0 &&
        newTimeLeft.hours === 0 &&
        newTimeLeft.minutes === 0 &&
        newTimeLeft.seconds === 0
      ) {
        clearInterval(timer);
        onComplete?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  const sizes = {
    sm: {
      container: 'gap-2',
      value: 'text-2xl',
      label: 'text-xs',
      unit: 'min-w-[50px]',
    },
    md: {
      container: 'gap-4',
      value: 'text-4xl',
      label: 'text-sm',
      unit: 'min-w-[80px]',
    },
    lg: {
      container: 'gap-6',
      value: 'text-6xl',
      label: 'text-base',
      unit: 'min-w-[100px]',
    },
  };

  const units = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hours' },
    { value: timeLeft.minutes, label: 'Minutes' },
    { value: timeLeft.seconds, label: 'Seconds' },
  ];

  return (
    <motion.div
      className={cn('flex items-center justify-center', sizes[size].container, className)}
      variants={scaleIn}
      initial="hidden"
      animate="visible"
    >
      {units.map((unit, index) => (
        <React.Fragment key={unit.label}>
          <div className={cn('flex flex-col items-center', sizes[size].unit)}>
            <motion.div
              className={cn(
                'font-bold bg-gradient-primary bg-clip-text text-transparent tabular-nums',
                sizes[size].value
              )}
              key={unit.value}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {String(unit.value).padStart(2, '0')}
            </motion.div>
            {showLabels && (
              <div className={cn('text-text-muted font-medium uppercase', sizes[size].label)}>
                {unit.label}
              </div>
            )}
          </div>
          {index < units.length - 1 && (
            <div className={cn('text-accent-purple font-bold', sizes[size].value)}>
              :
            </div>
          )}
        </React.Fragment>
      ))}
    </motion.div>
  );
};

CountdownTimer.displayName = 'CountdownTimer';
