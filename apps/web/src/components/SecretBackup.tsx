'use client';

import { useState } from 'react';
import { Copy, Check, Download, Eye, EyeOff, Shield, AlertTriangle } from 'lucide-react';

interface SecretBackupProps {
  secret: string;
  onBackupConfirmed: () => void;
}

export function SecretBackup({ secret, onBackupConfirmed }: SecretBackupProps) {
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [hasBackedUp, setHasBackedUp] = useState(false); // Persistent flag for backup completion

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setHasBackedUp(true); // Persistent flag
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadSecret = () => {
    const content = `ShadowLaunch Commitment Secret
==============================

DO NOT SHARE THIS SECRET WITH ANYONE!

Your Secret:
${secret}

Instructions:
1. Keep this file in a safe, private location
2. You will need this secret during the Reveal Phase
3. Without this secret, you cannot claim your tokens
4. Your committed funds will be LOST if you lose this secret

Generated: ${new Date().toISOString()}
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shadowlaunch-secret-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setHasBackedUp(true); // Persistent flag
  };

  const handleConfirm = () => {
    if (!hasBackedUp) return;
    setConfirmed(true);
    onBackupConfirmed();
  };

  const maskedSecret = showSecret
    ? secret
    : secret.slice(0, 8) + '•'.repeat(48) + secret.slice(-8);

  return (
    <div className="space-y-4">
      {/* Secret Display */}
      <div className="bg-cyber-black border border-neon-green/30 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-400 text-sm">Your Secret</span>
          <button
            onClick={() => setShowSecret(!showSecret)}
            className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 text-sm"
          >
            {showSecret ? (
              <>
                <EyeOff className="w-4 h-4" />
                Hide
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Show
              </>
            )}
          </button>
        </div>

        <div className="font-mono text-sm break-all bg-cyber-dark/50 p-3 rounded-lg text-neon-green">
          {maskedSecret}
        </div>
      </div>

      {/* Backup Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={copyToClipboard}
          className={`
            flex items-center justify-center gap-2 py-3 rounded-lg border transition-all
            ${copied
              ? 'bg-neon-green/20 border-neon-green text-neon-green'
              : 'border-gray-600 text-gray-400 hover:text-white hover:border-gray-500'
            }
          `}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy
            </>
          )}
        </button>

        <button
          onClick={downloadSecret}
          className={`
            flex items-center justify-center gap-2 py-3 rounded-lg border transition-all
            ${downloaded
              ? 'bg-neon-green/20 border-neon-green text-neon-green'
              : 'border-gray-600 text-gray-400 hover:text-white hover:border-gray-500'
            }
          `}
        >
          {downloaded ? (
            <>
              <Check className="w-4 h-4" />
              Downloaded!
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download
            </>
          )}
        </button>
      </div>

      {/* Warning */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="text-red-400 font-bold mb-1">Critical Warning</p>
          <ul className="text-gray-400 space-y-1 list-disc list-inside">
            <li>Never share this secret with anyone</li>
            <li>Store it in a secure, private location</li>
            <li>Without this secret, your funds are PERMANENTLY LOST</li>
          </ul>
        </div>
      </div>

      {/* Confirmation */}
      <div className={`
        border rounded-xl p-4 transition-all
        ${confirmed
          ? 'bg-neon-green/10 border-neon-green/50'
          : 'border-gray-600'
        }
      `}>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => {
              if (e.target.checked && hasBackedUp) {
                handleConfirm();
              } else if (!e.target.checked) {
                setConfirmed(false);
              }
            }}
            disabled={!hasBackedUp}
            className="mt-1 w-5 h-5 rounded border-gray-600 bg-cyber-dark text-neon-green focus:ring-neon-green focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div>
            <span className={`font-medium ${confirmed ? 'text-neon-green' : 'text-white'}`}>
              I have securely backed up my secret
            </span>
            <p className="text-gray-500 text-sm mt-1">
              I understand that losing this secret means losing my committed funds forever.
            </p>
          </div>
        </label>
      </div>

      {!hasBackedUp && (
        <p className="text-gray-500 text-sm text-center">
          Please copy or download your secret before confirming
        </p>
      )}
    </div>
  );
}
