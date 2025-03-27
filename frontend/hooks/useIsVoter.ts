'use client'

import { useReadContract } from 'wagmi'
import { useAccount } from 'wagmi'
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/utils/constants'

export function useIsVoter() {
    const { address, isConnected } = useAccount()

    const { data, isLoading, isError } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'isRegisteredVoter',
        args: [address],
        query: {
            enabled: !!address,
        },
    })

    const isRegistered = Boolean(data)

    return {
        isRegistered,
        isLoading,
        isConnected,
        isError,
    }
}