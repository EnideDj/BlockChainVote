'use client'

import { useEffect, useState } from 'react'
import { usePublicClient } from 'wagmi'
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/utils/constants'

export function useWorkflowStep() {
    const publicClient = usePublicClient()
    const [step, setStep] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [isError, setIsError] = useState(false)

    const fetchStep = async () => {
        if (!publicClient) return
        try {
            const result = await publicClient.readContract({
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'workflowStatus',
            })

            const raw = Number(result)
            setStep(raw)
            setIsLoading(false)
        } catch (err) {
            console.error('Erreur lecture workflowStatus:', err)
            setIsError(true)
        }
    }

    useEffect(() => {
        if (!publicClient) return

        fetchStep()

        const unwatch = publicClient.watchContractEvent({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            eventName: 'WorkflowStatusChange',
            onLogs: () => {
                console.log('📢 Event reçu : changement de workflow')
                fetchStep()
            },
        })

        return () => {
            if (unwatch) unwatch()
        }
    }, [publicClient])

    if (!publicClient) {
        return {
            step: 0,
            isLoading: true,
            isError: false,
            refetch: () => {},
        }
    }

    return {
        step,
        isLoading,
        isError,
        refetch: fetchStep,
    }
}