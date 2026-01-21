'use client';

import { useState } from 'react';
import { Lock, AlertTriangle, Copy, Check, Shield, Eye, EyeOff } from 'lucide-react';
import { SecretBackup } from './SecretBackup';

interface CommitFormProps {
  launchId: string;
  tokenSymbol: string;
  pricePerToken: number;
  maxSupply: number;
  minContribution?: number;
  maxContribution?: number;
  onCommit: (amount: number, secret: string) => Promise<void>;
}

export function CommitForm({ launchId, tokenSymbol, pricePerToken, maxSupply, minContribution, maxContribution, onCommit }: CommitFormProps) {
  const [amount, setAmount] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [isGeneratingSecret, setIsGeneratingSecret] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [secretBackedUp, setSecretBackedUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [step, setStep] = useState<'amount' | 'secret' | 'confirm'>('amount');

  const generateSecret = () => {
    setIsGeneratingSecret(true);
    // Generate a secure random secret
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const newSecret = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
    setSecret(newSecret);
    setIsGeneratingSecret(false);
    setStep('secret');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setError('');
    }
  };

  const calculateTokens = () => {
    const numAmount = parseFloat(amount) || 0;
    return Math.floor(numAmount / pricePerToken);
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!secretBackedUp) {
      setError('Please confirm you have backed up your secret');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onCommit(parseFloat(amount), secret);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit commitment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const estimatedTokens = calculateTokens();
  const maxTokens = maxSupply;
  const aleoAmount = parseFloat(amount) || 0;

  return (
    <div className="space-y-6">
      {/* Step 1: Enter Amount */}
      {step === 'amount' && (
        <div className="space-y-4">
          <div className="bg-cyber-black/50 border border-neon-green/20 rounded-xl p-6">
            <label className="block text-gray-400 text-sm mb-2">
              Commitment Amount (ALEO)
            </label>
            <div className="relative">
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0.00"
                className="cyber-input w-full text-2xl font-mono py-4 px-4 rounded-lg pr-20"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                ALEO
              </span>
            </div>

            {/* Contribution Limits */}
            {(minContribution || maxContribution) && (
              <div className="mt-4 p-3 bg-cyber-dark/50 rounded-lg flex items-center justify-between text-sm">
                <span className="text-gray-500">Limits:</span>
                <div className="flex items-center gap-3">
                  {minContribution && (
                    <span className="text-gray-400">
                      Min: <span className="font-mono text-white">{minContribution}</span> ALEO
                    </span>
                  )}
                  {maxContribution && (
                    <span className="text-neon-purple">
                      Max: <span className="font-mono font-bold">{maxContribution}</span> ALEO
                    </span>
                  )}
                </div>
              </div>
            )}

            {amount && parseFloat(amount) > 0 && (
              <div className="mt-4 p-4 bg-neon-green/5 border border-neon-green/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Estimated tokens</span>
                  <span className="text-neon-green font-mono font-bold">
                    {estimatedTokens.toLocaleString()} {tokenSymbol}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-gray-400 text-sm">Price per token</span>
                  <span className="text-gray-300 font-mono">
                    {pricePerToken} ALEO
                  </span>
                </div>
                {/* Limit warnings */}
                {minContribution && parseFloat(amount) < minContribution && (
                  <div className="mt-2 text-yellow-400 text-xs flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Below minimum contribution
                  </div>
                )}
                {maxContribution && parseFloat(amount) > maxContribution && (
                  <div className="mt-2 text-red-400 text-xs flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Exceeds maximum contribution (anti-whale limit)
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={generateSecret}
            disabled={
              !amount ||
              parseFloat(amount) <= 0 ||
              isGeneratingSecret ||
              (minContribution ? parseFloat(amount) < minContribution : false) ||
              (maxContribution ? parseFloat(amount) > maxContribution : false)
            }
            className="cyber-button w-full py-4 rounded-xl flex items-center justify-center gap-2"
          >
            {isGeneratingSecret ? (
              <>
                <div className="w-5 h-5 border-2 border-cyber-black border-t-transparent rounded-full animate-spin" />
                Generating Secret...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                Generate Commitment Secret
              </>
            )}
          </button>
        </div>
      )}

      {/* Step 2: Backup Secret */}
      {step === 'secret' && (
        <div className="space-y-4">
          <div className="bg-neon-orange/10 border border-neon-orange/50 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-neon-orange flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-neon-orange font-bold mb-1">Save Your Secret!</h4>
              <p className="text-gray-300 text-sm">
                You will need this secret to reveal your commitment and claim your tokens.
                If you lose it, your funds will be locked forever.
              </p>
            </div>
          </div>

          <SecretBackup
            secret={secret}
            onBackupConfirmed={() => setSecretBackedUp(true)}
          />

          <div className="flex gap-3">
            <button
              onClick={() => setStep('amount')}
              className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep('confirm')}
              disabled={!secretBackedUp}
              className="cyber-button flex-1 py-3 rounded-xl flex items-center justify-center gap-2"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 'confirm' && (
        <div className="space-y-4">
          <div className="bg-cyber-black/50 border border-neon-green/20 rounded-xl p-6">
            <h4 className="text-lg font-bold mb-4">Confirm Your Commitment</h4>

            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Amount</span>
                <span className="font-mono font-bold">{aleoAmount} ALEO</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Estimated Tokens</span>
                <span className="font-mono font-bold text-neon-green">
                  {estimatedTokens.toLocaleString()} {tokenSymbol}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-400">Secret Backed Up</span>
                <span className="text-neon-green flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  Confirmed
                </span>
              </div>
            </div>
          </div>

          <div className="bg-neon-green/5 border border-neon-green/20 rounded-xl p-4 flex items-start gap-3">
            <Shield className="w-6 h-6 text-neon-green flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-neon-green font-bold mb-1">Your Privacy is Protected</h4>
              <p className="text-gray-400 text-sm">
                Your commitment amount will be encrypted and hidden until the reveal phase.
                No one can see how much you committed.
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep('secret')}
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 transition-colors disabled:opacity-50"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="cyber-button flex-1 py-4 rounded-xl flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-cyber-black border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Commit Privately
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
