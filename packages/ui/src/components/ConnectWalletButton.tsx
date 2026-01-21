import React, { useState } from 'react';
import { Wallet, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { Button } from './Button';
import { slideUp } from '../animations/variants';

export interface ConnectWalletButtonProps {
  onConnect?: () => void;
  onDisconnect?: () => void;
  address?: string;
  isConnected?: boolean;
  isConnecting?: boolean;
  className?: string;
}

/**
 * Wallet connection button with dropdown for connected state
 *
 * @example
 * <ConnectWalletButton
 *   onConnect={handleConnect}
 *   onDisconnect={handleDisconnect}
 *   isConnected={isConnected}
 *   address={walletAddress}
 * />
 */
export const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({
  onConnect,
  onDisconnect,
  address,
  isConnected = false,
  isConnecting = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleClick = () => {
    if (!isConnected) {
      onConnect?.();
    } else {
      setIsOpen(!isOpen);
    }
  };

  const handleDisconnect = () => {
    setIsOpen(false);
    onDisconnect?.();
  };

  if (!isConnected) {
    return (
      <Button
        variant="primary"
        leftIcon={<Wallet className="w-5 h-5" />}
        onClick={handleClick}
        isLoading={isConnecting}
        className={className}
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        rightIcon={<ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />}
        onClick={handleClick}
        className={cn('font-mono', className)}
      >
        <Wallet className="w-5 h-5 mr-2" />
        {formatAddress(address || '')}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-lg shadow-glow-md overflow-hidden z-50"
            variants={slideUp}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="p-3 border-b border-border">
              <p className="text-xs text-text-muted mb-1">Connected Wallet</p>
              <p className="text-sm text-text-primary font-mono break-all">
                {address}
              </p>
            </div>

            <button
              onClick={handleDisconnect}
              className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-surface-hover transition-colors duration-200"
            >
              Disconnect
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

ConnectWalletButton.displayName = 'ConnectWalletButton';
