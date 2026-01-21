'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  Zap,
  Users,
  Clock,
  ArrowRight,
  Rocket,
  CheckCircle,
  AlertTriangle,
  Bot,
  Target,
} from 'lucide-react';
import { LaunchCard } from '@/components/LaunchCard';

interface Launch {
  id: string;
  name: string;
  tokenSymbol: string;
  totalSupply: number;
  pricePerToken: number;
  status: 'COMMIT' | 'REVEAL' | 'DISTRIBUTION' | 'ENDED';
  participantCount: number;
  endsAt: string;
  totalRevealed?: number;
}

// Mock data for demonstration
const mockLaunches: Launch[] = [
  {
    id: '1',
    name: 'Shadow Protocol',
    tokenSymbol: 'SHDW',
    totalSupply: 1000000,
    pricePerToken: 0.001,
    status: 'COMMIT',
    participantCount: 47,
    endsAt: new Date(Date.now() + 3600000 * 2).toISOString(),
  },
  {
    id: '2',
    name: 'Stealth Finance',
    tokenSymbol: 'STLTH',
    totalSupply: 500000,
    pricePerToken: 0.005,
    status: 'REVEAL',
    participantCount: 89,
    endsAt: new Date(Date.now() + 3600000 * 1).toISOString(),
    totalRevealed: 125000,
  },
  {
    id: '3',
    name: 'Cipher DAO',
    tokenSymbol: 'CPHR',
    totalSupply: 2000000,
    pricePerToken: 0.0005,
    status: 'DISTRIBUTION',
    participantCount: 234,
    endsAt: new Date(Date.now() - 3600000).toISOString(),
    totalRevealed: 850000,
  },
];

const features = [
  {
    icon: EyeOff,
    title: 'Sealed-Bid Mechanism',
    description: 'Your commitment amount is encrypted and hidden until the reveal phase. No one can see how much others are bidding.',
  },
  {
    icon: Bot,
    title: 'No Bots',
    description: 'Zero-knowledge proofs ensure only real humans can participate. Sybil attacks are mathematically impossible.',
  },
  {
    icon: Target,
    title: 'No Snipers',
    description: 'Last-second sniping is useless when all bids are revealed simultaneously. Fair allocation guaranteed.',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Your wallet balance and participation history remain completely private on the Aleo blockchain.',
  },
];

const steps = [
  {
    phase: 'COMMIT',
    title: 'Commit Phase',
    description: 'Submit your sealed bid. The amount is encrypted on-chain.',
    icon: Lock,
    color: 'neon-green',
  },
  {
    phase: 'REVEAL',
    title: 'Reveal Phase',
    description: 'Reveal your secret to prove your commitment. All reveals happen together.',
    icon: Eye,
    color: 'neon-cyan',
  },
  {
    phase: 'DISTRIBUTION',
    title: 'Distribution',
    description: 'Tokens are allocated fairly based on your revealed commitment.',
    icon: Zap,
    color: 'neon-purple',
  },
];

export default function HomePage() {
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLaunches = async () => {
      try {
        // Get API base URL with /api prefix
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3014';
        const apiBase = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;

        const response = await fetch(`${apiBase}/launches`);
        if (response.ok) {
          const data = await response.json();
          setLaunches(data.launches || []);
        } else {
          setLaunches(mockLaunches);
        }
      } catch (error) {
        setLaunches(mockLaunches);
      } finally {
        setLoading(false);
      }
    };

    fetchLaunches();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-cyber-black/80 backdrop-blur-md border-b border-neon-green/20">
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

            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link
                href="/create"
                className="cyber-button px-4 py-2 rounded-lg text-sm"
              >
                Launch Token
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-green/10 border border-neon-green/30 mb-6">
              <Shield className="w-4 h-4 text-neon-green" />
              <span className="text-neon-green text-sm font-medium">Powered by Aleo Zero-Knowledge Proofs</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            <span className="text-white">Fair Launches.</span>
            <br />
            <span className="text-neon-green neon-text">No Snipers.</span>
            <br />
            <span className="text-neon-cyan neon-text-cyan">No Bots.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto mb-10"
          >
            The first truly private token launchpad. Your bids are sealed, your identity protected,
            and allocations are mathematically fair.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/create"
              className="cyber-button px-8 py-4 rounded-xl text-lg flex items-center gap-2"
            >
              <Rocket className="w-5 h-5" />
              Launch Your Token
            </Link>
            <Link
              href="#launches"
              className="px-8 py-4 rounded-xl border border-neon-green/30 text-neon-green hover:bg-neon-green/10 transition-all flex items-center gap-2"
            >
              View Active Launches
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-neon-green/10 via-transparent to-transparent blur-3xl" />
      </section>

      {/* How it Works */}
      <section className="py-20 px-4 bg-cyber-darker/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl font-bold mb-4">
              The Sealed-Bid <span className="text-neon-green">Mechanism</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              A three-phase process that ensures complete fairness and privacy for all participants.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.phase}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="cyber-card p-8 rounded-2xl h-full">
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-12 h-12 rounded-xl bg-${step.color}/20 flex items-center justify-center`}>
                      <step.icon className={`w-6 h-6 text-${step.color}`} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Phase {index + 1}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold phase-${step.phase.toLowerCase()} bg-${step.color}/20 text-${step.color}`}>
                        {step.phase}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-gray-400">{step.description}</p>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-8 h-8 text-neon-green/50" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl font-bold mb-4">
              Why <span className="text-neon-cyan">ShadowLaunch</span>?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Built on Aleo's zero-knowledge infrastructure for maximum privacy and fairness.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="cyber-card p-6 rounded-xl"
              >
                <div className="w-12 h-12 rounded-lg bg-neon-green/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-neon-green" />
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Active Launches */}
      <section id="launches" className="py-20 px-4 bg-cyber-darker/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="font-display text-4xl font-bold mb-2">
                Active <span className="text-neon-green">Launches</span>
              </h2>
              <p className="text-gray-400">Participate in ongoing token launches</p>
            </div>
            <Link
              href="/dashboard"
              className="text-neon-green hover:text-neon-greenDark transition-colors flex items-center gap-2"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="cyber-card p-6 rounded-xl animate-pulse">
                  <div className="h-6 bg-cyber-light rounded w-3/4 mb-4" />
                  <div className="h-4 bg-cyber-light rounded w-1/2 mb-6" />
                  <div className="h-20 bg-cyber-light rounded mb-4" />
                  <div className="h-10 bg-cyber-light rounded" />
                </div>
              ))}
            </div>
          ) : launches.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {launches.map((launch, index) => (
                <motion.div
                  key={launch.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <LaunchCard launch={launch} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 cyber-card rounded-xl">
              <Rocket className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No active launches at the moment</p>
              <Link href="/create" className="cyber-button px-6 py-3 rounded-lg inline-flex items-center gap-2">
                <Rocket className="w-4 h-4" />
                Be the first to launch
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="cyber-card p-12 rounded-3xl text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-neon-green/10 via-transparent to-neon-purple/10" />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-green to-neon-cyan flex items-center justify-center mx-auto mb-6">
                <Rocket className="w-8 h-8 text-cyber-black" />
              </div>
              <h2 className="font-display text-4xl font-bold mb-4">
                Ready to Launch?
              </h2>
              <p className="text-gray-400 max-w-lg mx-auto mb-8">
                Create your own fair token launch in minutes. Set your parameters, and let the sealed-bid mechanism handle the rest.
              </p>
              <Link
                href="/create"
                className="cyber-button px-10 py-4 rounded-xl text-lg inline-flex items-center gap-3"
              >
                <Rocket className="w-5 h-5" />
                Launch Your Token
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-neon-green/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-green to-neon-cyan flex items-center justify-center">
              <Rocket className="w-4 h-4 text-cyber-black" />
            </div>
            <span className="font-display font-bold">SHADOWLAUNCH</span>
          </div>
          <div className="text-gray-500 text-sm">
            Built on Aleo - The Privacy-First Blockchain
          </div>
          <div className="flex items-center gap-4 text-gray-400 text-sm">
            <span className="privacy-badge">
              <Shield className="w-3 h-3" />
              ZK-Verified
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
