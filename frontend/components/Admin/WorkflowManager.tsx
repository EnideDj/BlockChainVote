'use client'

import { useEffect, useState } from 'react'
import { waitForTransactionReceipt, writeContract, readContract } from '@wagmi/core'
import { useAccount, useConfig } from 'wagmi'
import { useWorkflowStep } from '@/hooks/useWorkflowStep'
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/utils/constants'
import { workflowSteps } from '@/utils/workflowSteps'
import { motion } from 'framer-motion'
import { Users, FilePlus, Ban, Vote, Lock, CheckCircle2 } from 'lucide-react'

const iconsMap = {
    Users,
    FilePlus,
    Ban,
    Vote,
    Lock,
    CheckCircle2,
}

const Button = ({
                    children,
                    ...props
                }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button
        {...props}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded px-4 py-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
        {children}
    </button>
)

export default function WorkflowManager() {
    const { step, isLoading, refetch } = useWorkflowStep()
    const config = useConfig()
    const { address } = useAccount()
    const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')

    const current = workflowSteps[step]
    const next = workflowSteps[step + 1]

    useEffect(() => {
        refetch()
    }, [refetch])

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
            console.error('❌ Erreur passage étape :', err)
            setStatus('error')
        } finally {
            setTimeout(() => setStatus('idle'), 3000)
        }
    }

    return (
        <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white p-6 rounded-xl shadow-md"
        >
            <h2 className="text-xl font-semibold mb-4">⚙️ Gérer le processus</h2>

            <ul className="space-y-4 mb-6">
                {workflowSteps.map((stepItem, index) => {
                    const Icon = iconsMap[stepItem.icon as keyof typeof iconsMap] || Users
                    const isActive = index === step
                    const isDone = index < step

                    return (
                        <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-start gap-3"
                        >
                            <Icon
                                size={20}
                                className={
                                    isActive
                                        ? 'text-blue-600'
                                        : isDone
                                            ? 'text-green-600'
                                            : 'text-gray-400'
                                }
                            />
                            <div>
                                <p
                                    className={`font-medium ${
                                        isActive
                                            ? 'text-blue-600'
                                            : isDone
                                                ? 'text-gray-700'
                                                : 'text-gray-500'
                                    }`}
                                >
                                    {stepItem.label}
                                </p>
                                <p className="text-sm text-gray-400">{stepItem.description}</p>
                            </div>
                        </motion.li>
                    )
                })}
            </ul>

            {step < workflowSteps.length - 1 && (
                <div className="mt-6">
                    <p className="text-sm mb-2 text-gray-600">
                        Prochaine étape : <strong>{next?.label}</strong>
                    </p>
                    <Button onClick={handleNextStep} disabled={status === 'pending'}>
                        {status === 'pending' ? '⏳ En cours...' : '➡️ Passer à l’étape suivante'}
                    </Button>
                    {status === 'success' && (
                        <p className="text-green-600 mt-2">Étape passée avec succès !</p>
                    )}
                    {status === 'error' && (
                        <p className="text-red-600 mt-2">Une erreur est survenue.</p>
                    )}
                </div>
            )}
        </motion.div>
    )
}