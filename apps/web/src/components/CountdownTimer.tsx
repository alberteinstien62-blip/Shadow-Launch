'use client';

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: string;
  onComplete?: () => void;
  compact?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export function CountdownTimer({ targetDate, onComplete, compact = false }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - Date.now();

      if (difference <= 0) {
        onComplete?.();
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          total: 0,
        };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        total: difference,
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  const padNumber = (num: number) => num.toString().padStart(2, '0');

  if (compact) {
    if (timeLeft.total <= 0) {
      return <span className="text-gray-500 font-mono text-sm">Ended</span>;
    }

    if (timeLeft.days > 0) {
      return (
        <span className="text-neon-green font-mono text-sm font-bold">
          {timeLeft.days}d {padNumber(timeLeft.hours)}h
        </span>
      );
    }

    return (
      <span className="text-neon-green font-mono text-sm font-bold animate-countdown">
        {padNumber(timeLeft.hours)}:{padNumber(timeLeft.minutes)}:{padNumber(timeLeft.seconds)}
      </span>
    );
  }

  if (timeLeft.total <= 0) {
    return (
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-500">Time's Up!</div>
      </div>
    );
  }

  const timeUnits = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  // Filter out days if 0
  const displayUnits = timeLeft.days > 0 ? timeUnits : timeUnits.slice(1);

  return (
    <div className="flex items-center justify-center gap-3">
      {displayUnits.map((unit, index) => (
        <div key={unit.label} className="flex items-center gap-3">
          <div className="flex flex-col items-center">
            <div className="bg-cyber-dark border border-neon-green/30 rounded-lg px-4 py-3 min-w-[70px]">
              <span className="countdown-digit block text-center">
                {padNumber(unit.value)}
              </span>
            </div>
            <span className="text-gray-500 text-xs uppercase tracking-wider mt-2">
              {unit.label}
            </span>
          </div>
          {index < displayUnits.length - 1 && (
            <span className="text-neon-green text-2xl font-bold self-start mt-3 animate-pulse">:</span>
          )}
        </div>
      ))}
    </div>
  );
}

interface CountdownProgressProps {
  startDate: string;
  endDate: string;
  phase: string;
}

export function CountdownProgress({ startDate, endDate, phase }: CountdownProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const calculateProgress = () => {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      const now = Date.now();

      if (now >= end) return 100;
      if (now <= start) return 0;

      return ((now - start) / (end - start)) * 100;
    };

    setProgress(calculateProgress());

    const timer = setInterval(() => {
      setProgress(calculateProgress());
    }, 1000);

    return () => clearInterval(timer);
  }, [startDate, endDate]);

  const phaseColors: Record<string, string> = {
    COMMIT: 'from-neon-green to-neon-greenDark',
    REVEAL: 'from-neon-cyan to-neon-cyanDark',
    DISTRIBUTION: 'from-neon-purple to-neon-purpleDark',
    ENDED: 'from-gray-500 to-gray-600',
  };

  return (
    <div className="w-full">
      <div className="h-2 bg-cyber-light rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${phaseColors[phase] || phaseColors.COMMIT} transition-all duration-1000 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-gray-500 text-xs">{Math.round(progress)}% complete</span>
        <CountdownTimer targetDate={endDate} compact />
      </div>
    </div>
  );
}
