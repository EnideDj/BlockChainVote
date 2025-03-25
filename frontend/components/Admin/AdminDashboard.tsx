'use client'

import { motion } from 'framer-motion'
import AddVoter from './AddVoter'
import RemoveVoter from './RemoveVoter'
import VoterList from './VoterList'
import { useWorkflowStep } from '@/hooks/useWorkflowStep'
import { useEffect, useState } from 'react'
import { workflowSteps } from '@/utils/workflowSteps'
import { writeContract, waitForTransactionReceipt } from '@wagmi/core'
import { useAccount, useConfig } from 'wagmi'
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/utils/constants'
import ProposalList from "@/components/Shared/ProposalList";

export default function AdminDashboard() {
    const { step, isLoading, refetch } = useWorkflowStep()
    const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
    const [refreshKey, setRefreshKey] = useState(0)

    const config = useConfig()
    const { address } = useAccount()

    const currentStep = workflowSteps[step]
    const nextStep = workflowSteps[step + 1]

    const handleNextStep = async () => {
        try {
            setStatus('pending')

            const tx = await writeContract(config, {
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'nextWorkflowStatus',
                account: address,
            })

            await waitForTransactionReceipt(config, { hash: tx })

            await refetch()

            setStatus('success')
        } catch (err) {
            console.error('Erreur passage étape :', err)
            setStatus('error')
        } finally {
            setTimeout(() => setStatus('idle'), 3000)
        }
    }

    const triggerRefresh = () => {
        setRefreshKey((prev) => prev + 1)
    }

    useEffect(() => {
        const interval = setInterval(() => {
            refetch()
        }, 2000)
        return () => clearInterval(interval)
    }, [refetch])

    if (isLoading) return <p>⏳ Chargement...</p>

    return (
        <motion.section
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <div className="bg-white rounded-xl shadow p-6 space-y-4 border">
                <div>
                    <p className="text-gray-700">
                        <strong className="text-blue-600">
                            Étape {step + 1} : {currentStep.label}
                        </strong>
                    </p>
                    <p className="text-sm text-gray-500">{currentStep.description}</p>
                </div>

                {step === 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AddVoter onSuccess={triggerRefresh} />
                        <RemoveVoter onSuccess={triggerRefresh} />
                        <div className="md:col-span-2">
                            <VoterList refresh={refreshKey} />
                        </div>
                    </div>
                )}
                {step === 1 && (
                    <div className="mt-6">
                        <ProposalList />
                    </div>
                )}
                {step == 2 && (
                    <div className="p-4 border rounded text-gray-700 bg-gray-50">
                        ⚠️ Aucune action n’est disponible à cette étape pour l’admin.
                    </div>
                )}

                {nextStep && (
                    <div className="border-t pt-4">
                        <p className="text-gray-600 text-sm mb-2">
                            Prochaine étape : <strong>{nextStep.label}</strong>
                        </p>
                        <button
                            onClick={handleNextStep}
                            disabled={status === 'pending'}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
                        >
                            {status === 'pending' ? '⏳ Passage en cours...' : '➡️ Passer à l’étape suivante'}
                        </button>
                        {status === 'success' && (
                            <p className="text-green-600 mt-2">Étape passée avec succès !</p>
                        )}
                        {status === 'error' && (
                            <p className="text-red-600 mt-2">Une erreur est survenue.</p>
                        )}
                    </div>
                )}
            </div>
        </motion.section>
    )
}