'use client'

import { useReadContract } from 'wagmi'
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/utils/constants'

export function useWorkflowStep() {
    const { data, isLoading, isError, refetch } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'workflowStatus',
    })

    const step = typeof data === 'bigint' ? Number(data) : 0

    return {
        step,
        isLoading,
        isError,
        refetch,
    }
}