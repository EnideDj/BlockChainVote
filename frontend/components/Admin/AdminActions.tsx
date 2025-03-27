'use client'

import { useState } from 'react'
import { writeContract, waitForTransactionReceipt } from '@wagmi/core'
import { useAccount, useConfig, usePublicClient } from 'wagmi'
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/utils/constants'

export function useAdminActions(refetch: () => Promise<any>) {
    const config = useConfig()
    const publicClient = usePublicClient()
    const { address } = useAccount()

    const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')

    const readCurrentWorkflowStatus = async (): Promise<number> => {
        if (!publicClient) throw new Error('publicClient is undefined')

        const result = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'workflowStatus',
        })
        return Number(result)
    }

    const handleNextStep = async () => {
        try {
            setStatus('pending')

            let tx = await writeContract(config, {
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'nextWorkflowStatus',
                account: address,
            })
            await waitForTransactionReceipt(config, { hash: tx })
            await refetch()

            const updatedStatus = await readCurrentWorkflowStatus()
            if (updatedStatus === 2) {
                tx = await writeContract(config, {
                    address: CONTRACT_ADDRESS,
                    abi: CONTRACT_ABI,
                    functionName: 'nextWorkflowStatus',
                    account: address,
                })
                await waitForTransactionReceipt(config, { hash: tx })
                await refetch()
            }

            setStatus('success')
        } catch (err) {
            console.error('Erreur passage étape :', err)
            setStatus('error')
        } finally {
            setTimeout(() => setStatus('idle'), 3000)
        }
    }

    const handleTallyVotes = async () => {
        try {
            setStatus('pending')
            const tx = await writeContract(config, {
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'tallyVotes',
                account: address,
            })
            await waitForTransactionReceipt(config, { hash: tx })
            await refetch()
            setStatus('success')
        } catch (err) {
            console.error('Erreur tallyVotes :', err)
            setStatus('error')
        } finally {
            setTimeout(() => setStatus('idle'), 3000)
        }
    }

    const handleResetSession = async () => {
        try {
            setStatus('pending');

            const tx = await writeContract(config, {
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'resetVotingSession',
                account: address,
            });

            await waitForTransactionReceipt(config, { hash: tx });
            await refetch();

            setStatus('success');
        } catch (err) {
            console.error('Erreur resetVotingSession :', err);
            setStatus('error');
        } finally {
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    return { status, handleNextStep, handleTallyVotes, handleResetSession }
}