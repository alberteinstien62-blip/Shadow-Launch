'use client';

import { useState } from 'react';
import { Eye, AlertCircle, Check, Shield, Coins } from 'lucide-react';

interface RevealFormProps {
  launchId: string;
  tokenSymbol: string;
  committedAmount?: number;
  onReveal: (secret: string) => Promise<{ tokensAllocated: number }>;
}

export function RevealForm({ launchId, tokenSymbol, committedAmount, onReveal }: RevealFormProps) {
  const [secret, setSecret] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<{ tokensAllocated: number } | null>(null);

  const handleSubmit = async () => {
    if (!secret.trim()) {
      setError('Please enter your commitment secret');
      return;
    }

    if (secret.length < 32) {
      setError('Invalid secret format. Please check your backup.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const revealResult = await onReveal(secret);
      setResult(revealResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reveal commitment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-neon-green/20 flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-neon-green" />
          </div>
          <h3 className="text-2xl font-bold text-neon-green mb-2">
            Reveal Successful!
          </h3>
          <p className="text-gray-400">
            Your commitment has been revealed and verified.
          </p>
        </div>

        <div className="bg-cyber-black/50 border border-neon-green/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Tokens Allocated</span>
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-neon-green" />
              <span className="text-2xl font-bold font-mono text-neon-green">
                {result.tokensAllocated.toLocaleString()} {tokenSymbol}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-neon-cyan/5 border border-neon-cyan/20 rounded-xl p-4 flex items-start gap-3">
          <Shield className="w-6 h-6 text-neon-cyan flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-neon-cyan font-bold mb-1">What's Next?</h4>
            <p className="text-gray-400 text-sm">
              Your tokens will be automatically distributed to your wallet once the distribution
              phase completes. Check your wallet after the countdown ends.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-neon-cyan/10 border border-neon-cyan/50 rounded-xl p-4 flex items-start gap-3">
        <Eye className="w-6 h-6 text-neon-cyan flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-neon-cyan font-bold mb-1">Reveal Phase Active</h4>
          <p className="text-gray-300 text-sm">
            Enter your commitment secret to reveal your bid and claim your token allocation.
            All participants must reveal before the phase ends.
          </p>
        </div>
      </div>

      {committedAmount && (
        <div className="bg-cyber-black/50 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Your Commitment</span>
            <span className="font-mono font-bold text-white">
              {committedAmount} ALEO
            </span>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <label className="block text-gray-400 text-sm">
          Your Commitment Secret
        </label>
        <textarea
          value={secret}
          onChange={(e) => {
            setSecret(e.target.value);
            setError('');
          }}
          placeholder="Paste your 64-character secret here..."
          className="cyber-input w-full h-32 font-mono text-sm py-4 px-4 rounded-lg resize-none"
        />

        <div className="text-gray-500 text-xs flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          The secret you saved during the commit phase
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={isSubmitting || !secret.trim()}
        className="cyber-button w-full py-4 rounded-xl flex items-center justify-center gap-2"
        style={{
          background: 'linear-gradient(135deg, #00f0ff 0%, #00c0cc 100%)',
        }}
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-cyber-black border-t-transparent rounded-full animate-spin" />
            Revealing...
          </>
        ) : (
          <>
            <Eye className="w-5 h-5" />
            Reveal & Claim
          </>
        )}
      </button>

      <div className="bg-cyber-dark/50 rounded-xl p-4 text-center">
        <p className="text-gray-500 text-sm">
          Lost your secret?{' '}
          <span className="text-gray-400">
            Unfortunately, commitments cannot be recovered without the original secret.
            Your funds will remain locked.
          </span>
        </p>
      </div>
    </div>
  );
}
