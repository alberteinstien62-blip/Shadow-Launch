import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Button,
  Card,
  Input,
  Badge,
  Modal,
  LoadingSpinner,
  ConnectWalletButton,
  PrivacyBadge,
  CountdownTimer,
  ProgressBar,
  fadeIn,
  staggerChildren,
} from '../src';
import { Wallet, Lock, TrendingUp, Users } from 'lucide-react';

/**
 * Example application showcasing all UI components
 * This demonstrates the cyberpunk theme and component usage
 */
export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [progress, setProgress] = useState(45);

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 7);

  return (
    <div className="min-h-screen bg-background cyberpunk-grid p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.header
          className="flex items-center justify-between mb-12"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
        >
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">
              Aleo Privacy Suite
            </h1>
            <p className="text-text-secondary">
              Cyberpunk UI Component Library
            </p>
          </div>
          <ConnectWalletButton
            isConnected={isConnected}
            address="aleo1q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q2q"
            onConnect={() => setIsConnected(true)}
            onDisconnect={() => setIsConnected(false)}
          />
        </motion.header>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          variants={staggerChildren}
          initial="hidden"
          animate="visible"
        >
          <Card variant="glass" glowEffect padding="lg">
            <div className="flex items-center justify-between mb-4">
              <Lock className="w-8 h-8 text-accent-purple" />
              <Badge variant="success" dot pulse>
                Active
              </Badge>
            </div>
            <h3 className="text-2xl font-bold text-text-primary mb-1">
              1,234
            </h3>
            <p className="text-text-muted text-sm">Private Transactions</p>
          </Card>

          <Card variant="glass" glowEffect padding="lg">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-accent-pink" />
              <PrivacyBadge level="maximum" />
            </div>
            <h3 className="text-2xl font-bold text-text-primary mb-1">
              $2.5M
            </h3>
            <p className="text-text-muted text-sm">Total Volume</p>
          </Card>

          <Card variant="glass" glowEffect padding="lg">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-accent-cyan" />
              <Badge variant="purple">+12%</Badge>
            </div>
            <h3 className="text-2xl font-bold text-text-primary mb-1">
              567
            </h3>
            <p className="text-text-muted text-sm">Active Users</p>
          </Card>

          <Card variant="glass" glowEffect padding="lg">
            <div className="flex items-center justify-between mb-4">
              <Wallet className="w-8 h-8 text-accent-green" />
              <Badge variant="info" dot>
                Live
              </Badge>
            </div>
            <h3 className="text-2xl font-bold text-text-primary mb-1">
              98.5%
            </h3>
            <p className="text-text-muted text-sm">Privacy Score</p>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Countdown Timer Section */}
          <Card
            variant="glass"
            header={
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-text-primary">
                  Next Launch Phase
                </h2>
                <PrivacyBadge level="high" showLabel size="sm" />
              </div>
            }
          >
            <CountdownTimer
              targetDate={targetDate}
              onComplete={() => console.log('Launch complete!')}
              showLabels
              size="md"
            />
          </Card>

          {/* Progress Section */}
          <Card
            variant="glass"
            header={
              <h2 className="text-xl font-bold text-text-primary">
                Campaign Progress
              </h2>
            }
          >
            <div className="space-y-6">
              <ProgressBar
                value={progress}
                label="Token Sale"
                showPercentage
                variant="gradient"
                animated
              />
              <ProgressBar
                value={78}
                label="Privacy Pool"
                showPercentage
                variant="success"
                animated
              />
              <ProgressBar
                value={92}
                label="Staking Rewards"
                showPercentage
                variant="default"
                animated
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setProgress(Math.max(0, progress - 10))}
                >
                  -10%
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setProgress(Math.min(100, progress + 10))}
                >
                  +10%
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Form Section */}
        <Card
          variant="glass"
          header={
            <h2 className="text-xl font-bold text-text-primary">
              Private Transfer
            </h2>
          }
          footer={
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setIsModalOpen(true)}>
                Preview
              </Button>
              <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                Send Transaction
              </Button>
            </div>
          }
          className="mb-12"
        >
          <div className="space-y-4">
            <Input
              label="Recipient Address"
              placeholder="aleo1..."
              leftIcon={<Wallet className="w-5 h-5" />}
            />
            <Input
              label="Amount"
              placeholder="0.00"
              type="number"
              helperText="Minimum: 0.01 ALEO"
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Privacy Level
                </label>
                <div className="flex gap-2">
                  <PrivacyBadge level="medium" showLabel />
                  <PrivacyBadge level="high" showLabel />
                  <PrivacyBadge level="maximum" showLabel />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Transaction Status
                </label>
                <div className="flex gap-2">
                  <Badge variant="success" dot pulse>
                    Confirmed
                  </Badge>
                  <Badge variant="warning" dot>
                    Pending
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Loading States */}
        <Card variant="glass" padding="lg" className="mb-12">
          <h2 className="text-xl font-bold text-text-primary mb-6">
            Loading States
          </h2>
          <div className="flex flex-wrap items-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <LoadingSpinner size="sm" variant="default" />
              <span className="text-xs text-text-muted">Small</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <LoadingSpinner size="md" variant="gradient" />
              <span className="text-xs text-text-muted">Medium</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <LoadingSpinner size="lg" variant="dots" />
              <span className="text-xs text-text-muted">Large</span>
            </div>
            <div className="flex-1">
              <Button variant="primary" isLoading className="w-full">
                Loading Button
              </Button>
            </div>
          </div>
        </Card>

        {/* Button Variants */}
        <Card variant="glass" padding="lg">
          <h2 className="text-xl font-bold text-text-primary mb-6">
            Button Variants
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="primary" size="sm">
              Small
            </Button>
            <Button variant="primary" size="lg">
              Large
            </Button>
            <Button
              variant="primary"
              leftIcon={<Lock className="w-5 h-5" />}
            >
              With Icon
            </Button>
          </div>
        </Card>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirm Private Transaction"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setIsModalOpen(false)}>
              Confirm & Send
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-surface rounded-lg">
            <span className="text-text-muted">Privacy Level:</span>
            <PrivacyBadge level="maximum" showLabel />
          </div>
          <div className="flex items-center justify-between p-4 bg-surface rounded-lg">
            <span className="text-text-muted">Gas Fee:</span>
            <span className="text-text-primary font-medium">0.001 ALEO</span>
          </div>
          <div className="p-4 bg-accent-purple/10 border border-accent-purple/50 rounded-lg">
            <p className="text-sm text-text-secondary">
              This transaction will be completely private. No one will be able
              to see the sender, recipient, or amount.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
