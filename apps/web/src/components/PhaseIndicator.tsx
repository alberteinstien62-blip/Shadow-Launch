'use client';

import { Lock, Eye, Zap, CheckCircle, XCircle } from 'lucide-react';

type Phase = 'COMMIT' | 'REVEAL' | 'DISTRIBUTION' | 'ENDED' | 'FAILED';

interface PhaseIndicatorProps {
  phase: Phase;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const phaseConfig = {
  COMMIT: {
    label: 'Commit',
    icon: Lock,
    color: 'neon-green',
    bgColor: 'bg-neon-green/20',
    textColor: 'text-neon-green',
    borderColor: 'border-neon-green/50',
    description: 'Submit your sealed bid',
  },
  REVEAL: {
    label: 'Reveal',
    icon: Eye,
    color: 'neon-cyan',
    bgColor: 'bg-neon-cyan/20',
    textColor: 'text-neon-cyan',
    borderColor: 'border-neon-cyan/50',
    description: 'Reveal your commitment',
  },
  DISTRIBUTION: {
    label: 'Distribution',
    icon: Zap,
    color: 'neon-purple',
    bgColor: 'bg-neon-purple/20',
    textColor: 'text-neon-purple',
    borderColor: 'border-neon-purple/50',
    description: 'Tokens being distributed',
  },
  ENDED: {
    label: 'Ended',
    icon: CheckCircle,
    color: 'gray',
    bgColor: 'bg-gray-500/20',
    textColor: 'text-gray-500',
    borderColor: 'border-gray-500/50',
    description: 'Launch completed',
  },
  FAILED: {
    label: 'Failed',
    icon: XCircle,
    color: 'red',
    bgColor: 'bg-red-500/20',
    textColor: 'text-red-400',
    borderColor: 'border-red-500/50',
    description: 'Soft cap not reached',
  },
};

const sizeConfig = {
  sm: {
    container: 'px-2 py-1',
    icon: 'w-3 h-3',
    text: 'text-xs',
  },
  md: {
    container: 'px-3 py-1.5',
    icon: 'w-4 h-4',
    text: 'text-sm',
  },
  lg: {
    container: 'px-4 py-2',
    icon: 'w-5 h-5',
    text: 'text-base',
  },
};

export function PhaseIndicator({ phase, showLabel = true, size = 'sm' }: PhaseIndicatorProps) {
  const config = phaseConfig[phase];
  const sizing = sizeConfig[size];
  const Icon = config.icon;

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 rounded-full
        ${config.bgColor} ${config.textColor} border ${config.borderColor}
        ${sizing.container}
        font-medium uppercase tracking-wider
      `}
    >
      <Icon className={`${sizing.icon} ${phase !== 'ENDED' && phase !== 'FAILED' ? 'animate-pulse' : ''}`} />
      {showLabel && <span className={sizing.text}>{config.label}</span>}
    </div>
  );
}

interface PhaseProgressProps {
  currentPhase: Phase;
}

export function PhaseProgress({ currentPhase }: PhaseProgressProps) {
  const phases: Phase[] = ['COMMIT', 'REVEAL', 'DISTRIBUTION', 'ENDED'];
  const currentIndex = phases.indexOf(currentPhase);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        {phases.map((phase, index) => {
          const config = phaseConfig[phase];
          const Icon = config.icon;
          const isActive = phase === currentPhase;
          const isCompleted = index < currentIndex;
          const isPending = index > currentIndex;

          return (
            <div key={phase} className="flex flex-col items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  transition-all duration-300
                  ${isActive ? `${config.bgColor} ${config.textColor} animate-pulse shadow-lg` : ''}
                  ${isCompleted ? 'bg-neon-green/30 text-neon-green' : ''}
                  ${isPending ? 'bg-cyber-light text-gray-600' : ''}
                `}
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span
                className={`
                  text-xs mt-2 font-medium uppercase tracking-wider
                  ${isActive ? config.textColor : ''}
                  ${isCompleted ? 'text-neon-green' : ''}
                  ${isPending ? 'text-gray-600' : ''}
                `}
              >
                {config.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="relative h-1 bg-cyber-light rounded-full mt-4">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-neon-green via-neon-cyan to-neon-purple rounded-full transition-all duration-500"
          style={{ width: `${((currentIndex + 1) / phases.length) * 100}%` }}
        />
      </div>

      {/* Current phase description */}
      <div className="mt-4 text-center">
        <p className={`text-sm ${phaseConfig[currentPhase].textColor}`}>
          {phaseConfig[currentPhase].description}
        </p>
      </div>
    </div>
  );
}
