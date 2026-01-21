'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Rocket,
  Coins,
  Clock,
  AlertCircle,
  CheckCircle,
  Shield,
  Info,
  Globe,
  Twitter,
  MessageCircle,
  Send,
  Target,
  Users,
  PieChart,
  Lock,
  Sparkles,
} from 'lucide-react';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { useWalletModal } from '@demox-labs/aleo-wallet-adapter-reactui';
import { Transaction, WalletAdapterNetwork } from '@demox-labs/aleo-wallet-adapter-base';
import { TokenomicsBar } from '@/components/TokenomicsChart';
import toast from 'react-hot-toast';

interface LaunchFormData {
  // Basic Info
  name: string;
  tokenSymbol: string;
  totalSupply: string;
  pricePerToken: string;
  description: string;
  longDescription: string;

  // Timing
  commitDuration: string;
  revealDuration: string;

  // Caps
  softCap: string;
  hardCap: string;
  minPerWallet: string;
  maxPerWallet: string;

  // Social Links
  websiteUrl: string;
  twitterUrl: string;
  discordUrl: string;
  telegramUrl: string;

  // Tokenomics
  teamAllocation: string;
  communityAllocation: string;
  liquidityAllocation: string;
  marketingAllocation: string;
  reserveAllocation: string;

  // Vesting
  vestingEnabled: boolean;
  vestingCliff: string;
  vestingDuration: string;
  vestingInitialRelease: string;
}

const initialFormData: LaunchFormData = {
  name: '',
  tokenSymbol: '',
  totalSupply: '',
  pricePerToken: '',
  description: '',
  longDescription: '',
  commitDuration: '24',
  revealDuration: '12',
  softCap: '',
  hardCap: '',
  minPerWallet: '',
  maxPerWallet: '',
  websiteUrl: '',
  twitterUrl: '',
  discordUrl: '',
  telegramUrl: '',
  teamAllocation: '',
  communityAllocation: '50',
  liquidityAllocation: '',
  marketingAllocation: '',
  reserveAllocation: '',
  vestingEnabled: false,
  vestingCliff: '30',
  vestingDuration: '180',
  vestingInitialRelease: '20',
};

export default function CreateLaunchPage() {
  const router = useRouter();
  const { publicKey, requestTransaction, connected } = useWallet();
  const { setVisible: setWalletModalVisible } = useWalletModal();
  const [formData, setFormData] = useState<LaunchFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<LaunchFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'basics' | 'details' | 'tokenomics' | 'review' | 'success'>('basics');
  const [createdLaunchId, setCreatedLaunchId] = useState<string | null>(null);
  const [onChainTxId, setOnChainTxId] = useState<string | null>(null);
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'success' | 'failed'>('idle');

  const validateBasics = (): boolean => {
    const newErrors: Partial<LaunchFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Token name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Token name must be at least 3 characters';
    }

    if (!formData.tokenSymbol.trim()) {
      newErrors.tokenSymbol = 'Token symbol is required';
    } else if (!/^[A-Z]{2,6}$/.test(formData.tokenSymbol.toUpperCase())) {
      newErrors.tokenSymbol = 'Symbol must be 2-6 uppercase letters';
    }

    const supply = parseFloat(formData.totalSupply);
    if (!formData.totalSupply || supply <= 0) {
      newErrors.totalSupply = 'Total supply must be greater than 0';
    } else if (supply > 1000000000000) {
      newErrors.totalSupply = 'Total supply is too large';
    }

    const price = parseFloat(formData.pricePerToken);
    if (!formData.pricePerToken || price <= 0) {
      newErrors.pricePerToken = 'Price must be greater than 0';
    }

    const commitHours = parseInt(formData.commitDuration);
    if (!formData.commitDuration || commitHours < 1 || commitHours > 168) {
      newErrors.commitDuration = 'Commit duration must be 1-168 hours';
    }

    const revealHours = parseInt(formData.revealDuration);
    if (!formData.revealDuration || revealHours < 1 || revealHours > 72) {
      newErrors.revealDuration = 'Reveal duration must be 1-72 hours';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateDetails = (): boolean => {
    const newErrors: Partial<LaunchFormData> = {};
    const totalValue = parseFloat(formData.totalSupply || '0') * parseFloat(formData.pricePerToken || '0');

    // Validate soft cap if provided
    if (formData.softCap) {
      const softCap = parseFloat(formData.softCap);
      if (softCap <= 0) {
        newErrors.softCap = 'Soft cap must be positive';
      } else if (totalValue > 0 && softCap > totalValue) {
        newErrors.softCap = `Soft cap cannot exceed total value (${totalValue.toLocaleString()} ALEO)`;
      }
    }

    // Validate hard cap if provided
    if (formData.hardCap) {
      const hardCap = parseFloat(formData.hardCap);
      if (hardCap <= 0) {
        newErrors.hardCap = 'Hard cap must be positive';
      } else if (formData.softCap && hardCap < parseFloat(formData.softCap)) {
        newErrors.hardCap = 'Hard cap must be >= soft cap';
      }
    }

    // Validate max per wallet if provided
    if (formData.maxPerWallet) {
      const maxPer = parseFloat(formData.maxPerWallet);
      if (maxPer <= 0) {
        newErrors.maxPerWallet = 'Max must be positive';
      }
    }

    // Validate min per wallet if provided
    if (formData.minPerWallet) {
      const minPer = parseFloat(formData.minPerWallet);
      if (minPer <= 0) {
        newErrors.minPerWallet = 'Min must be positive';
      } else if (formData.maxPerWallet && minPer > parseFloat(formData.maxPerWallet)) {
        newErrors.minPerWallet = 'Min must be <= max';
      }
    }

    // Validate URLs if provided
    const urlPattern = /^https?:\/\/.+/;
    if (formData.websiteUrl && !urlPattern.test(formData.websiteUrl)) {
      newErrors.websiteUrl = 'Invalid URL format';
    }
    if (formData.twitterUrl && !urlPattern.test(formData.twitterUrl)) {
      newErrors.twitterUrl = 'Invalid URL format';
    }
    if (formData.discordUrl && !urlPattern.test(formData.discordUrl)) {
      newErrors.discordUrl = 'Invalid URL format';
    }
    if (formData.telegramUrl && !urlPattern.test(formData.telegramUrl)) {
      newErrors.telegramUrl = 'Invalid URL format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateTokenomics = (): boolean => {
    const newErrors: Partial<LaunchFormData> = {};

    // Calculate total allocation
    const total =
      (parseFloat(formData.teamAllocation) || 0) +
      (parseFloat(formData.communityAllocation) || 0) +
      (parseFloat(formData.liquidityAllocation) || 0) +
      (parseFloat(formData.marketingAllocation) || 0) +
      (parseFloat(formData.reserveAllocation) || 0);

    if (total > 100) {
      newErrors.teamAllocation = 'Total allocation cannot exceed 100%';
    }

    // Validate vesting if enabled
    if (formData.vestingEnabled) {
      const cliff = parseInt(formData.vestingCliff);
      const duration = parseInt(formData.vestingDuration);
      const initial = parseFloat(formData.vestingInitialRelease);

      if (cliff < 0) {
        newErrors.vestingCliff = 'Cliff must be positive';
      }
      if (duration < cliff) {
        newErrors.vestingDuration = 'Duration must be >= cliff';
      }
      if (initial < 0 || initial > 100) {
        newErrors.vestingInitialRelease = 'Initial release must be 0-100%';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof LaunchFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleNextStep = () => {
    if (step === 'basics' && validateBasics()) {
      setStep('details');
    } else if (step === 'details' && validateDetails()) {
      setStep('tokenomics');
    } else if (step === 'tokenomics' && validateTokenomics()) {
      setStep('review');
    }
  };

  const handlePrevStep = () => {
    if (step === 'details') setStep('basics');
    else if (step === 'tokenomics') setStep('details');
    else if (step === 'review') setStep('tokenomics');
  };

  const handleSubmit = async () => {
    // Check wallet connection first
    if (!connected || !publicKey) {
      setWalletModalVisible(true);
      toast('Please connect your Leo Wallet first', { icon: '🦊' });
      return;
    }

    if (!requestTransaction) {
      toast.error('Wallet does not support transactions');
      return;
    }

    setIsSubmitting(true);
    setDeploymentStatus('idle');

    try {
      const payload = {
        name: formData.name,
        tokenSymbol: formData.tokenSymbol.toUpperCase(),
        totalSupply: parseFloat(formData.totalSupply),
        pricePerToken: parseFloat(formData.pricePerToken),
        description: formData.description || undefined,
        longDescription: formData.longDescription || undefined,
        commitDurationHours: parseInt(formData.commitDuration),
        revealDurationHours: parseInt(formData.revealDuration),
        creatorAddress: publicKey || undefined,
        // Caps
        softCap: formData.softCap ? parseFloat(formData.softCap) : undefined,
        hardCap: formData.hardCap ? parseFloat(formData.hardCap) : undefined,
        minPerWallet: formData.minPerWallet ? parseFloat(formData.minPerWallet) : undefined,
        maxPerWallet: formData.maxPerWallet ? parseFloat(formData.maxPerWallet) : undefined,
        // Social links
        websiteUrl: formData.websiteUrl || undefined,
        twitterUrl: formData.twitterUrl || undefined,
        discordUrl: formData.discordUrl || undefined,
        telegramUrl: formData.telegramUrl || undefined,
        // Tokenomics
        teamAllocation: formData.teamAllocation ? parseFloat(formData.teamAllocation) : undefined,
        communityAllocation: formData.communityAllocation ? parseFloat(formData.communityAllocation) : undefined,
        liquidityAllocation: formData.liquidityAllocation ? parseFloat(formData.liquidityAllocation) : undefined,
        marketingAllocation: formData.marketingAllocation ? parseFloat(formData.marketingAllocation) : undefined,
        reserveAllocation: formData.reserveAllocation ? parseFloat(formData.reserveAllocation) : undefined,
        // Vesting
        vestingEnabled: formData.vestingEnabled,
        vestingCliff: formData.vestingEnabled ? parseInt(formData.vestingCliff) : undefined,
        vestingDuration: formData.vestingEnabled ? parseInt(formData.vestingDuration) : undefined,
        vestingInitialRelease: formData.vestingEnabled ? parseFloat(formData.vestingInitialRelease) : undefined,
      };

      // Get API base URL with /api prefix
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3014';
      const apiBase = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;

      toast.loading('Creating launch in database...', { id: 'create' });

      const response = await fetch(`${apiBase}/launches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to create launch in database');
      }

      const data = await response.json();
      const launchId = data.launch?.id;

      if (!launchId) {
        throw new Error('No launch ID returned from API');
      }

      toast.dismiss('create');
      toast.success('Launch created in database!');

      // Now deploy to Aleo blockchain
      setDeploymentStatus('deploying');
      toast.loading('Deploying to Aleo blockchain...', { id: 'deploy' });

      // Generate numeric launch ID hash for Leo (use first 8 hex chars of UUID)
      const launchIdHash = parseInt(launchId.replace(/-/g, '').slice(0, 15), 16) || Date.now();

      // Hash the token symbol to a field
      const tokenSymbolHash = Array.from(formData.tokenSymbol.toUpperCase())
        .reduce((acc, char) => acc * 31 + char.charCodeAt(0), 0) >>> 0;

      // Calculate durations in blocks (assuming ~3 seconds per block on testnet)
      const blocksPerHour = Math.floor(3600 / 3); // ~1200 blocks per hour
      const commitDurationBlocks = parseInt(formData.commitDuration) * blocksPerHour;
      const revealDurationBlocks = parseInt(formData.revealDuration) * blocksPerHour;

      // Price in microcredits (1 ALEO = 1,000,000 microcredits)
      const priceInMicrocredits = Math.floor(parseFloat(formData.pricePerToken) * 1_000_000);

      // Total supply as integer
      const totalSupplyInt = Math.floor(parseFloat(formData.totalSupply));

      const aleoTransaction = Transaction.createTransaction(
        publicKey,
        WalletAdapterNetwork.TestnetBeta,
        'shadowlaunch_v1.aleo',
        'create_launch',
        [
          `${launchIdHash}field`,           // launch_id
          `${tokenSymbolHash}field`,        // token_symbol
          `${totalSupplyInt}u64`,           // total_supply
          `${priceInMicrocredits}u64`,      // price_per_token (microcredits)
          `${commitDurationBlocks}u32`,     // commit_duration_blocks
          `${revealDurationBlocks}u32`,     // reveal_duration_blocks
        ],
        1_000_000, // fee (1 ALEO)
        false
      );

      const txId = await requestTransaction(aleoTransaction);
      console.log('Launch deployment transaction submitted:', txId);

      toast.dismiss('deploy');
      toast.success('Launch deployed to Aleo!');
      setOnChainTxId(txId);
      setDeploymentStatus('success');

      // Update the launch in database with transaction ID
      try {
        await fetch(`${apiBase}/launches/${launchId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transactionId: txId,
            onChainStatus: 'pending',
          }),
        });
      } catch (updateError) {
        console.warn('Failed to update launch with tx ID:', updateError);
      }

      setCreatedLaunchId(launchId);
      setStep('success');
    } catch (error: any) {
      console.error('Create launch error:', error);
      toast.dismiss('create');
      toast.dismiss('deploy');

      // Check if it's a wallet rejection
      if (error.message?.includes('rejected') || error.message?.includes('cancelled')) {
        toast.error('Transaction was rejected by wallet');
        setDeploymentStatus('failed');
      } else {
        toast.error(error.message || 'Failed to create launch');
        setDeploymentStatus('failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalValue = parseFloat(formData.totalSupply || '0') * parseFloat(formData.pricePerToken || '0');
  const totalAllocation =
    (parseFloat(formData.teamAllocation) || 0) +
    (parseFloat(formData.communityAllocation) || 0) +
    (parseFloat(formData.liquidityAllocation) || 0) +
    (parseFloat(formData.marketingAllocation) || 0) +
    (parseFloat(formData.reserveAllocation) || 0);

  const stepIndicators = [
    { key: 'basics', label: 'Basics', icon: Coins },
    { key: 'details', label: 'Details', icon: Target },
    { key: 'tokenomics', label: 'Tokenomics', icon: PieChart },
    { key: 'review', label: 'Review', icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-cyber-black/80 backdrop-blur-md border-b border-neon-green/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-green to-neon-cyan flex items-center justify-center">
                <Rocket className="w-6 h-6 text-cyber-black" />
              </div>
              <span className="font-display font-bold text-xl tracking-wider">
                SHADOW<span className="text-neon-green">LAUNCH</span>
              </span>
            </Link>

            <Link
              href="/"
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        {step !== 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-green to-neon-cyan flex items-center justify-center mx-auto mb-4">
              <Rocket className="w-8 h-8 text-cyber-black" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Create Token Launch</h1>
            <p className="text-gray-400">
              Launch your token with sealed-bid fairness on Aleo
            </p>
          </motion.div>
        )}

        {/* Step Indicators */}
        {step !== 'success' && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {stepIndicators.map((s, index) => {
              const Icon = s.icon;
              const isActive = s.key === step;
              const isPast = stepIndicators.findIndex(si => si.key === step) > index;
              return (
                <div key={s.key} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-neon-green text-cyber-black'
                        : isPast
                        ? 'bg-neon-green/20 text-neon-green'
                        : 'bg-gray-800 text-gray-500'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  {index < stepIndicators.length - 1 && (
                    <div className={`w-12 h-0.5 ${isPast ? 'bg-neon-green' : 'bg-gray-800'}`} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Step 1: Basics */}
        {step === 'basics' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="cyber-card p-8 rounded-2xl"
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Coins className="w-5 h-5 text-neon-green" />
              Basic Information
            </h2>

            <div className="space-y-6">
              {/* Token Name */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Token Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Shadow Protocol"
                  className={`cyber-input w-full py-3 px-4 rounded-lg ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Token Symbol */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Token Symbol *</label>
                <input
                  type="text"
                  value={formData.tokenSymbol}
                  onChange={(e) => handleInputChange('tokenSymbol', e.target.value.toUpperCase())}
                  placeholder="e.g., SHDW"
                  maxLength={6}
                  className={`cyber-input w-full py-3 px-4 rounded-lg uppercase ${errors.tokenSymbol ? 'border-red-500' : ''}`}
                />
                {errors.tokenSymbol && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.tokenSymbol}
                  </p>
                )}
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Short Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="A brief one-line description"
                  maxLength={200}
                  className="cyber-input w-full py-3 px-4 rounded-lg"
                />
              </div>

              {/* Supply and Price Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Total Supply *</label>
                  <input
                    type="text"
                    value={formData.totalSupply}
                    onChange={(e) => {
                      if (/^\d*$/.test(e.target.value)) {
                        handleInputChange('totalSupply', e.target.value);
                      }
                    }}
                    placeholder="1000000"
                    className={`cyber-input w-full py-3 px-4 rounded-lg font-mono ${errors.totalSupply ? 'border-red-500' : ''}`}
                  />
                  {errors.totalSupply && (
                    <p className="text-red-400 text-sm mt-1">{errors.totalSupply}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Price per Token (ALEO) *</label>
                  <input
                    type="text"
                    value={formData.pricePerToken}
                    onChange={(e) => {
                      if (/^\d*\.?\d*$/.test(e.target.value)) {
                        handleInputChange('pricePerToken', e.target.value);
                      }
                    }}
                    placeholder="0.001"
                    className={`cyber-input w-full py-3 px-4 rounded-lg font-mono ${errors.pricePerToken ? 'border-red-500' : ''}`}
                  />
                  {errors.pricePerToken && (
                    <p className="text-red-400 text-sm mt-1">{errors.pricePerToken}</p>
                  )}
                </div>
              </div>

              {/* Total Value Preview */}
              {totalValue > 0 && (
                <div className="bg-neon-green/5 border border-neon-green/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Total Launch Value</span>
                    <span className="text-neon-green font-mono font-bold text-lg">
                      {totalValue.toLocaleString()} ALEO
                    </span>
                  </div>
                </div>
              )}

              {/* Duration Settings */}
              <div className="border-t border-gray-800 pt-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-neon-cyan" />
                  Phase Durations
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Commit Duration (hours) *</label>
                    <input
                      type="number"
                      value={formData.commitDuration}
                      onChange={(e) => handleInputChange('commitDuration', e.target.value)}
                      min="1"
                      max="168"
                      className={`cyber-input w-full py-3 px-4 rounded-lg font-mono ${errors.commitDuration ? 'border-red-500' : ''}`}
                    />
                    <p className="text-gray-500 text-xs mt-1">1-168 hours (max 7 days)</p>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Reveal Duration (hours) *</label>
                    <input
                      type="number"
                      value={formData.revealDuration}
                      onChange={(e) => handleInputChange('revealDuration', e.target.value)}
                      min="1"
                      max="72"
                      className={`cyber-input w-full py-3 px-4 rounded-lg font-mono ${errors.revealDuration ? 'border-red-500' : ''}`}
                    />
                    <p className="text-gray-500 text-xs mt-1">1-72 hours (max 3 days)</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleNextStep}
                className="cyber-button w-full py-4 rounded-xl flex items-center justify-center gap-2"
              >
                Continue to Details
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Details */}
        {step === 'details' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="cyber-card p-8 rounded-2xl"
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-neon-cyan" />
              Launch Details
            </h2>

            <div className="space-y-6">
              {/* Fundraising Caps */}
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4 text-yellow-400" />
                  Fundraising Caps
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Soft Cap (ALEO)</label>
                    <input
                      type="text"
                      value={formData.softCap}
                      onChange={(e) => {
                        if (/^\d*\.?\d*$/.test(e.target.value)) {
                          handleInputChange('softCap', e.target.value);
                        }
                      }}
                      placeholder="Minimum to raise"
                      className={`cyber-input w-full py-3 px-4 rounded-lg font-mono ${errors.softCap ? 'border-red-500' : ''}`}
                    />
                    {errors.softCap && <p className="text-red-400 text-xs mt-1">{errors.softCap}</p>}
                    <p className="text-gray-500 text-xs mt-1">Refunds if not met</p>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Hard Cap (ALEO)</label>
                    <input
                      type="text"
                      value={formData.hardCap}
                      onChange={(e) => {
                        if (/^\d*\.?\d*$/.test(e.target.value)) {
                          handleInputChange('hardCap', e.target.value);
                        }
                      }}
                      placeholder="Maximum to raise"
                      className={`cyber-input w-full py-3 px-4 rounded-lg font-mono ${errors.hardCap ? 'border-red-500' : ''}`}
                    />
                    {errors.hardCap && <p className="text-red-400 text-xs mt-1">{errors.hardCap}</p>}
                  </div>
                </div>
              </div>

              {/* Anti-Whale Protection */}
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-neon-purple" />
                  Anti-Whale Protection
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Min per Wallet (ALEO)</label>
                    <input
                      type="text"
                      value={formData.minPerWallet}
                      onChange={(e) => {
                        if (/^\d*\.?\d*$/.test(e.target.value)) {
                          handleInputChange('minPerWallet', e.target.value);
                        }
                      }}
                      placeholder="1"
                      className={`cyber-input w-full py-3 px-4 rounded-lg font-mono ${errors.minPerWallet ? 'border-red-500' : ''}`}
                    />
                    {errors.minPerWallet && <p className="text-red-400 text-xs mt-1">{errors.minPerWallet}</p>}
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Max per Wallet (ALEO)</label>
                    <input
                      type="text"
                      value={formData.maxPerWallet}
                      onChange={(e) => {
                        if (/^\d*\.?\d*$/.test(e.target.value)) {
                          handleInputChange('maxPerWallet', e.target.value);
                        }
                      }}
                      placeholder="50"
                      className={`cyber-input w-full py-3 px-4 rounded-lg font-mono ${errors.maxPerWallet ? 'border-red-500' : ''}`}
                    />
                    {errors.maxPerWallet && <p className="text-red-400 text-xs mt-1">{errors.maxPerWallet}</p>}
                    <p className="text-gray-500 text-xs mt-1">Prevents whale domination</p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="border-t border-gray-800 pt-6">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-neon-green" />
                  Social Links
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2 flex items-center gap-2">
                        <Globe className="w-3 h-3" /> Website
                      </label>
                      <input
                        type="url"
                        value={formData.websiteUrl}
                        onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                        placeholder="https://yourproject.com"
                        className={`cyber-input w-full py-3 px-4 rounded-lg ${errors.websiteUrl ? 'border-red-500' : ''}`}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2 flex items-center gap-2">
                        <Twitter className="w-3 h-3" /> Twitter
                      </label>
                      <input
                        type="url"
                        value={formData.twitterUrl}
                        onChange={(e) => handleInputChange('twitterUrl', e.target.value)}
                        placeholder="https://twitter.com/..."
                        className={`cyber-input w-full py-3 px-4 rounded-lg ${errors.twitterUrl ? 'border-red-500' : ''}`}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2 flex items-center gap-2">
                        <MessageCircle className="w-3 h-3" /> Discord
                      </label>
                      <input
                        type="url"
                        value={formData.discordUrl}
                        onChange={(e) => handleInputChange('discordUrl', e.target.value)}
                        placeholder="https://discord.gg/..."
                        className={`cyber-input w-full py-3 px-4 rounded-lg ${errors.discordUrl ? 'border-red-500' : ''}`}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2 flex items-center gap-2">
                        <Send className="w-3 h-3" /> Telegram
                      </label>
                      <input
                        type="url"
                        value={formData.telegramUrl}
                        onChange={(e) => handleInputChange('telegramUrl', e.target.value)}
                        placeholder="https://t.me/..."
                        className={`cyber-input w-full py-3 px-4 rounded-lg ${errors.telegramUrl ? 'border-red-500' : ''}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Long Description */}
              <div className="border-t border-gray-800 pt-6">
                <label className="block text-gray-400 text-sm mb-2">Project Description</label>
                <textarea
                  value={formData.longDescription}
                  onChange={(e) => handleInputChange('longDescription', e.target.value)}
                  placeholder="Describe your project in detail. What problem does it solve? What makes it unique?"
                  rows={5}
                  className="cyber-input w-full py-3 px-4 rounded-lg resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handlePrevStep}
                  className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleNextStep}
                  className="cyber-button flex-1 py-4 rounded-xl"
                >
                  Continue to Tokenomics
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Tokenomics */}
        {step === 'tokenomics' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="cyber-card p-8 rounded-2xl"
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-neon-purple" />
              Tokenomics
            </h2>

            <div className="space-y-6">
              {/* Allocation Inputs */}
              <div>
                <h3 className="text-lg font-medium mb-4">Token Allocation (%)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2 flex items-center gap-2">
                      <Users className="w-3 h-3" /> Public Sale
                    </label>
                    <input
                      type="text"
                      value={formData.communityAllocation}
                      onChange={(e) => {
                        if (/^\d*\.?\d*$/.test(e.target.value)) {
                          handleInputChange('communityAllocation', e.target.value);
                        }
                      }}
                      placeholder="50"
                      className="cyber-input w-full py-3 px-4 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Team</label>
                    <input
                      type="text"
                      value={formData.teamAllocation}
                      onChange={(e) => {
                        if (/^\d*\.?\d*$/.test(e.target.value)) {
                          handleInputChange('teamAllocation', e.target.value);
                        }
                      }}
                      placeholder="15"
                      className="cyber-input w-full py-3 px-4 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Liquidity</label>
                    <input
                      type="text"
                      value={formData.liquidityAllocation}
                      onChange={(e) => {
                        if (/^\d*\.?\d*$/.test(e.target.value)) {
                          handleInputChange('liquidityAllocation', e.target.value);
                        }
                      }}
                      placeholder="20"
                      className="cyber-input w-full py-3 px-4 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Marketing</label>
                    <input
                      type="text"
                      value={formData.marketingAllocation}
                      onChange={(e) => {
                        if (/^\d*\.?\d*$/.test(e.target.value)) {
                          handleInputChange('marketingAllocation', e.target.value);
                        }
                      }}
                      placeholder="10"
                      className="cyber-input w-full py-3 px-4 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Reserve</label>
                    <input
                      type="text"
                      value={formData.reserveAllocation}
                      onChange={(e) => {
                        if (/^\d*\.?\d*$/.test(e.target.value)) {
                          handleInputChange('reserveAllocation', e.target.value);
                        }
                      }}
                      placeholder="5"
                      className="cyber-input w-full py-3 px-4 rounded-lg font-mono"
                    />
                  </div>
                </div>

                {/* Total Indicator */}
                <div className={`mt-4 p-4 rounded-lg ${totalAllocation > 100 ? 'bg-red-500/10 border border-red-500/30' : 'bg-cyber-dark/50'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Total Allocation</span>
                    <span className={`font-mono font-bold ${totalAllocation > 100 ? 'text-red-400' : totalAllocation === 100 ? 'text-neon-green' : 'text-yellow-400'}`}>
                      {totalAllocation}%
                    </span>
                  </div>
                  {totalAllocation > 0 && totalAllocation <= 100 && (
                    <div className="mt-3">
                      <TokenomicsBar
                        data={{
                          teamAllocation: parseFloat(formData.teamAllocation) || 0,
                          communityAllocation: parseFloat(formData.communityAllocation) || 0,
                          liquidityAllocation: parseFloat(formData.liquidityAllocation) || 0,
                          marketingAllocation: parseFloat(formData.marketingAllocation) || 0,
                          reserveAllocation: parseFloat(formData.reserveAllocation) || 0,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Vesting Schedule */}
              <div className="border-t border-gray-800 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Lock className="w-4 h-4 text-neon-cyan" />
                    Vesting Schedule
                  </h3>
                  <button
                    onClick={() => handleInputChange('vestingEnabled', !formData.vestingEnabled)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      formData.vestingEnabled
                        ? 'bg-neon-green/20 text-neon-green border border-neon-green/30'
                        : 'bg-gray-800 text-gray-400 border border-gray-700'
                    }`}
                  >
                    {formData.vestingEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                {formData.vestingEnabled && (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Cliff (days)</label>
                      <input
                        type="number"
                        value={formData.vestingCliff}
                        onChange={(e) => handleInputChange('vestingCliff', e.target.value)}
                        min="0"
                        className={`cyber-input w-full py-3 px-4 rounded-lg font-mono ${errors.vestingCliff ? 'border-red-500' : ''}`}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Duration (days)</label>
                      <input
                        type="number"
                        value={formData.vestingDuration}
                        onChange={(e) => handleInputChange('vestingDuration', e.target.value)}
                        min="1"
                        className={`cyber-input w-full py-3 px-4 rounded-lg font-mono ${errors.vestingDuration ? 'border-red-500' : ''}`}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Initial Release (%)</label>
                      <input
                        type="number"
                        value={formData.vestingInitialRelease}
                        onChange={(e) => handleInputChange('vestingInitialRelease', e.target.value)}
                        min="0"
                        max="100"
                        className={`cyber-input w-full py-3 px-4 rounded-lg font-mono ${errors.vestingInitialRelease ? 'border-red-500' : ''}`}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handlePrevStep}
                  className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleNextStep}
                  className="cyber-button flex-1 py-4 rounded-xl"
                >
                  Review Launch
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4: Review */}
        {step === 'review' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="cyber-card p-8 rounded-2xl"
          >
            <h2 className="text-xl font-bold mb-6">Review Your Launch</h2>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-3">
                <h3 className="font-medium text-neon-green">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Token Name</span>
                    <div className="font-bold">{formData.name}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Symbol</span>
                    <div className="font-mono text-neon-cyan">${formData.tokenSymbol}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Total Supply</span>
                    <div className="font-mono">{parseInt(formData.totalSupply).toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Price</span>
                    <div className="font-mono">{formData.pricePerToken} ALEO</div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Total Value</span>
                    <div className="font-mono text-neon-green font-bold">{totalValue.toLocaleString()} ALEO</div>
                  </div>
                </div>
              </div>

              {/* Caps */}
              {(formData.softCap || formData.hardCap || formData.minPerWallet || formData.maxPerWallet) && (
                <div className="border-t border-gray-800 pt-4 space-y-3">
                  <h3 className="font-medium text-yellow-400">Caps & Limits</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {formData.softCap && (
                      <div>
                        <span className="text-gray-500">Soft Cap</span>
                        <div className="font-mono">{formData.softCap} ALEO</div>
                      </div>
                    )}
                    {formData.hardCap && (
                      <div>
                        <span className="text-gray-500">Hard Cap</span>
                        <div className="font-mono">{formData.hardCap} ALEO</div>
                      </div>
                    )}
                    {formData.minPerWallet && (
                      <div>
                        <span className="text-gray-500">Min per Wallet</span>
                        <div className="font-mono">{formData.minPerWallet} ALEO</div>
                      </div>
                    )}
                    {formData.maxPerWallet && (
                      <div>
                        <span className="text-gray-500">Max per Wallet</span>
                        <div className="font-mono text-neon-purple">{formData.maxPerWallet} ALEO</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timing */}
              <div className="border-t border-gray-800 pt-4 space-y-3">
                <h3 className="font-medium text-neon-cyan">Phase Durations</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Commit Phase</span>
                    <div className="font-mono">{formData.commitDuration} hours</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Reveal Phase</span>
                    <div className="font-mono">{formData.revealDuration} hours</div>
                  </div>
                </div>
              </div>

              {/* Tokenomics */}
              {totalAllocation > 0 && (
                <div className="border-t border-gray-800 pt-4 space-y-3">
                  <h3 className="font-medium text-neon-purple">Tokenomics ({totalAllocation}%)</h3>
                  <TokenomicsBar
                    data={{
                      teamAllocation: parseFloat(formData.teamAllocation) || 0,
                      communityAllocation: parseFloat(formData.communityAllocation) || 0,
                      liquidityAllocation: parseFloat(formData.liquidityAllocation) || 0,
                      marketingAllocation: parseFloat(formData.marketingAllocation) || 0,
                      reserveAllocation: parseFloat(formData.reserveAllocation) || 0,
                    }}
                  />
                </div>
              )}

              {/* Vesting */}
              {formData.vestingEnabled && (
                <div className="border-t border-gray-800 pt-4 space-y-3">
                  <h3 className="font-medium text-neon-cyan">Vesting Schedule</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Initial Release</span>
                      <div className="font-mono">{formData.vestingInitialRelease}%</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Cliff</span>
                      <div className="font-mono">{formData.vestingCliff} days</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Duration</span>
                      <div className="font-mono">{formData.vestingDuration} days</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Warning */}
              <div className="bg-cyber-dark/50 rounded-lg p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-neon-cyan flex-shrink-0 mt-0.5" />
                <p className="text-gray-400 text-sm">
                  Once launched, these parameters cannot be changed. Make sure everything is correct before proceeding.
                </p>
              </div>

              {/* Privacy Info */}
              <div className="bg-neon-green/5 border border-neon-green/20 rounded-lg p-4 flex items-start gap-3">
                <Shield className="w-5 h-5 text-neon-green flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-neon-green font-medium mb-1">Privacy Guaranteed</p>
                  <p className="text-gray-400">
                    Your launch will use Aleo's zero-knowledge proofs to ensure all bids are
                    sealed and fair. No one can see commitment amounts until the reveal phase.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handlePrevStep}
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
                      {deploymentStatus === 'deploying' ? 'Deploying to Aleo...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Rocket className="w-5 h-5" />
                      {connected ? 'Launch Token' : 'Connect Wallet & Launch'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="cyber-card p-8 rounded-2xl text-center"
          >
            <div className="w-20 h-20 rounded-full bg-neon-green/20 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-neon-green" />
            </div>
            <h2 className="text-2xl font-bold text-neon-green mb-2">Launch Created!</h2>
            <p className="text-gray-400 mb-6">
              Your token launch is now live on Aleo. Share the link with your community.
            </p>

            <div className="bg-cyber-dark/50 rounded-lg p-4 mb-4">
              <p className="text-gray-500 text-sm mb-2">Launch URL</p>
              <code className="text-neon-cyan font-mono text-sm break-all">
                {typeof window !== 'undefined' ? window.location.origin : ''}/launch/{createdLaunchId}
              </code>
            </div>

            {/* On-chain Transaction Info */}
            {onChainTxId && (
              <div className="bg-neon-green/5 border border-neon-green/20 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-neon-green" />
                  <span className="text-neon-green font-medium">Deployed to Aleo</span>
                </div>
                <p className="text-gray-500 text-xs mb-2">Transaction ID</p>
                <a
                  href={`https://testnet.aleoscan.io/transaction?id=${onChainTxId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neon-cyan font-mono text-xs break-all hover:underline"
                >
                  {onChainTxId}
                </a>
              </div>
            )}

            <div className="flex gap-3">
              <Link
                href={`/launch/${createdLaunchId}`}
                className="cyber-button flex-1 py-3 rounded-xl flex items-center justify-center gap-2"
              >
                View Launch
              </Link>
              <Link
                href="/dashboard"
                className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 transition-colors flex items-center justify-center"
              >
                Go to Dashboard
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
