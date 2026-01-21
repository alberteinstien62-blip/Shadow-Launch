'use client';

import { Shield, ShieldCheck, UserCheck, Lock, ExternalLink } from 'lucide-react';

interface TrustBadgesProps {
  isAudited?: boolean;
  auditUrl?: string;
  auditFirm?: string;
  isKycVerified?: boolean;
  kycProvider?: string;
  isSafu?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}

export function TrustBadges({
  isAudited = false,
  auditUrl,
  auditFirm,
  isKycVerified = false,
  kycProvider,
  isSafu = false,
  size = 'md',
  showLabels = true,
}: TrustBadgesProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1 gap-1',
    md: 'text-sm px-3 py-1.5 gap-1.5',
    lg: 'text-base px-4 py-2 gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const badges = [];

  // AUDIT Badge
  if (isAudited) {
    badges.push(
      <a
        key="audit"
        href={auditUrl || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center ${sizeClasses[size]} rounded-full bg-neon-green/20 text-neon-green border border-neon-green/30 hover:bg-neon-green/30 transition-colors cursor-pointer`}
        title={auditFirm ? `Audited by ${auditFirm}` : 'Audited'}
      >
        <ShieldCheck className={iconSizes[size]} />
        {showLabels && <span className="font-medium">AUDITED</span>}
        {auditUrl && <ExternalLink className={`${iconSizes[size]} opacity-50`} />}
      </a>
    );
  } else {
    badges.push(
      <div
        key="audit-pending"
        className={`inline-flex items-center ${sizeClasses[size]} rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30`}
        title="Audit pending"
      >
        <Shield className={iconSizes[size]} />
        {showLabels && <span className="font-medium">PENDING AUDIT</span>}
      </div>
    );
  }

  // KYC Badge
  if (isKycVerified) {
    badges.push(
      <div
        key="kyc"
        className={`inline-flex items-center ${sizeClasses[size]} rounded-full bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30`}
        title={kycProvider ? `KYC verified by ${kycProvider}` : 'KYC Verified'}
      >
        <UserCheck className={iconSizes[size]} />
        {showLabels && <span className="font-medium">KYC</span>}
      </div>
    );
  }

  // SAFU Badge
  if (isSafu) {
    badges.push(
      <div
        key="safu"
        className={`inline-flex items-center ${sizeClasses[size]} rounded-full bg-neon-purple/20 text-neon-purple border border-neon-purple/30`}
        title="Funds are SAFU - Secured Asset Fund for Users"
      >
        <Lock className={iconSizes[size]} />
        {showLabels && <span className="font-medium">SAFU</span>}
      </div>
    );
  }

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {badges}
    </div>
  );
}

// Compact version for cards
export function TrustBadgesCompact({
  isAudited = false,
  isKycVerified = false,
  isSafu = false,
}: {
  isAudited?: boolean;
  isKycVerified?: boolean;
  isSafu?: boolean;
}) {
  const badges = [];

  if (isAudited) {
    badges.push(
      <div
        key="audit"
        className="w-6 h-6 rounded-full bg-neon-green/20 flex items-center justify-center"
        title="Audited"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-neon-green" />
      </div>
    );
  }

  if (isKycVerified) {
    badges.push(
      <div
        key="kyc"
        className="w-6 h-6 rounded-full bg-neon-cyan/20 flex items-center justify-center"
        title="KYC Verified"
      >
        <UserCheck className="w-3.5 h-3.5 text-neon-cyan" />
      </div>
    );
  }

  if (isSafu) {
    badges.push(
      <div
        key="safu"
        className="w-6 h-6 rounded-full bg-neon-purple/20 flex items-center justify-center"
        title="SAFU"
      >
        <Lock className="w-3.5 h-3.5 text-neon-purple" />
      </div>
    );
  }

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1">
      {badges}
    </div>
  );
}

// Trust score indicator
export function TrustScore({
  isAudited = false,
  isKycVerified = false,
  isSafu = false,
}: {
  isAudited?: boolean;
  isKycVerified?: boolean;
  isSafu?: boolean;
}) {
  const score = (isAudited ? 40 : 0) + (isKycVerified ? 35 : 0) + (isSafu ? 25 : 0);

  const getScoreColor = () => {
    if (score >= 75) return 'text-neon-green';
    if (score >= 40) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const getScoreLabel = () => {
    if (score >= 75) return 'High Trust';
    if (score >= 40) return 'Medium Trust';
    return 'Low Trust';
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 transform -rotate-90">
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="text-gray-700"
          />
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeDasharray={`${score * 1.25} 125`}
            className={getScoreColor()}
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${getScoreColor()}`}>
          {score}
        </span>
      </div>
      <div>
        <div className={`font-medium ${getScoreColor()}`}>{getScoreLabel()}</div>
        <div className="text-xs text-gray-500">Trust Score</div>
      </div>
    </div>
  );
}
