'use client'

import { WalletProvider } from './WalletProvider'
import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  )

  return (
    <WalletProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: 'cyber-card',
            style: {
              background: 'rgba(18, 18, 26, 0.95)',
              color: '#e5e5e5',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#0a0a0f',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#0a0a0f',
              },
            },
          }}
        />
      </QueryClientProvider>
    </WalletProvider>
  )
}
