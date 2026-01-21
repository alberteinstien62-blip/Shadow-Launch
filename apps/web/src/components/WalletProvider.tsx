'use client'

import { WalletProvider as AleoWalletProvider } from '@demox-labs/aleo-wallet-adapter-react'
import { WalletModalProvider } from '@demox-labs/aleo-wallet-adapter-reactui'
import { DecryptPermission, WalletAdapterNetwork } from '@demox-labs/aleo-wallet-adapter-base'
import { LeoWalletAdapter } from '@demox-labs/aleo-wallet-adapter-leo'
import { useMemo } from 'react'

// Import Aleo wallet adapter styles
import '@demox-labs/aleo-wallet-adapter-reactui/styles.css'

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const wallets = useMemo(() => [
    new LeoWalletAdapter({ appName: 'ShadowLaunch' }),
  ], [])

  return (
    <AleoWalletProvider
      wallets={wallets}
      decryptPermission={DecryptPermission.UponRequest}
      network={WalletAdapterNetwork.TestnetBeta}
      autoConnect={true}
    >
      <WalletModalProvider>
        {children}
      </WalletModalProvider>
    </AleoWalletProvider>
  )
}
