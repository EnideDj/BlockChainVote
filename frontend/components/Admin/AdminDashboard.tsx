'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import AddVoter from './AddVoter'
import RemoveVoter from './RemoveVoter'
import VoterList from './VoterList'
import ProposalList from '@/components/Shared/ProposalList'
import WinnerDisplay from '@/components/Shared/WinnerDisplay'
import PastResults from '@/components/Admin/PastResults'
import { useWorkflowStep } from '@/hooks/useWorkflowStep'
import { workflowSteps } from '@/utils/workflowSteps'
import { useAdminActions } from '@/components/Admin/AdminActions'
import { RefreshCcw, ArrowRight, PieChart, Loader2 } from 'lucide-react'

export default function AdminDashboard() {
    const { step, isLoading, refetch } = useWorkflowStep()
    const [refreshKey, setRefreshKey] = useState(0)

    const { status, handleNextStep, handleTallyVotes, handleResetSession } = useAdminActions(async () => await refetch());

    const currentStep = workflowSteps[step]
    const nextStep = step < workflowSteps.length - 1 ? workflowSteps[step + 1] : null

    const triggerRefresh = () => setRefreshKey((prev) => prev + 1)

    useEffect(() => {
        const interval = setInterval(() => {
            refetch()
        }, 2000)
        return () => clearInterval(interval)
    }, [refetch])

    if (isLoading) return <p><Loader2 className="animate-spin" size={16} /> Chargement...</p>

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
                    {currentStep ? (
                        <>
                            <p className="text-gray-700">
                                <strong className="text-blue-600">
                                    Étape {step + 1} : {currentStep.label}
                                </strong>
                            </p>
                            <p className="text-sm text-gray-500">{currentStep.description}</p>
                        </>
                    ) : (
                        <p className="text-red-600">⚠️ Étape inconnue ({step})</p>
                    )}
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

                {step === 3 && (
                    <div className="p-4 border rounded text-gray-700 bg-gray-50">
                        La session de vote est en cours. Les électeurs peuvent voter.
                        <ProposalList key={refreshKey} />
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-4">
                        <p className="text-gray-700 bg-yellow-100 border p-4 rounded">
                            La session de vote est terminée. Cliquez ci-dessous pour dépouiller les votes.
                        </p>

                        <button
                            onClick={handleTallyVotes}
                            disabled={status === 'pending'}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                        >
                            {status === 'pending' ? (
                                <><Loader2 className="animate-spin" size={16} /> Dépouillement...</>
                            ) : (
                                <>
                                    <PieChart size={16} />
                                    Dépouiller les votes
                                </>
                            )}
                        </button>
                    </div>
                )}

                {step === 5 && (
                    <div className="space-y-2">
                        <WinnerDisplay refreshKey={refreshKey} />
                        <PastResults />

                        <button
                            onClick={handleResetSession}
                            disabled={status === 'pending'}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                        >
                            {status === 'pending' ? (
                                <><Loader2 className="animate-spin" size={16} /> Réinitialisation...</>
                            ) : (
                                <>
                                    <RefreshCcw size={16} />
                                    Réinitialiser la session
                                </>
                            )}
                        </button>
                    </div>
                )}

                {step < workflowSteps.length - 2 && nextStep && (
                    <div className="border-t pt-4">
                        <p className="text-gray-600 text-sm mb-2">
                            Prochaine étape : <strong>{nextStep.label}</strong>
                        </p>
                        <button
                            onClick={handleNextStep}
                            disabled={status === 'pending'}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
                        >
                            {status === 'pending' ? (
                                <><Loader2 className="animate-spin" size={16} /> Passage en cours...</>
                            ) : (
                                <>
                                    <ArrowRight size={16} />
                                    Passer à l’étape suivante
                                </>
                            )}
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