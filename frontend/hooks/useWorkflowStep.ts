'use client'

import { useEffect, useState } from 'react'
import { usePublicClient } from 'wagmi'
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/utils/constants'

export function useWorkflowStep() {
    const publicClient = usePublicClient()
    const [step, setStep] = useState(0)
    const [realStep, setRealStep] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [isError, setIsError] = useState(false)

    const mapStep = (raw: number) => {
        switch (raw) {
            case 0: return 0
            case 1:
            case 2: return 1
            case 3: return 2
            case 4: return 3
            case 5: return 4
            default: return 0
        }
    }

    const fetchStep = async () => {
        if (!publicClient) return
        try {
            const result = await publicClient.readContract({
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'workflowStatus',
            })

            const raw = Number(result)
            const mapped = mapStep(raw)

            setStep(mapped)
            setRealStep(raw)
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
            realStep: 0,
            isLoading: true,
            isError: false,
            refetch: () => {},
        }
    }

    return {
        step,
        realStep,
        isLoading,
        isError,
        refetch: fetchStep,
    }
}