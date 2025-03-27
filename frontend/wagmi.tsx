'use client'

import React from 'react'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { sepolia, hardhat } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'

const projectId = 'b68aef352234575c6caeee95690dfb09'

const config = getDefaultConfig({
    appName: 'BlockchainVote',
    projectId,
    chains: [sepolia, hardhat],
    transports: {
        [sepolia.id]: http(),
        [hardhat.id]: http(),
    },
})

const queryClient = new QueryClient()

export function Web3Provider({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider>
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}