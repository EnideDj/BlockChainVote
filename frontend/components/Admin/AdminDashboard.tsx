'use client'

import { motion } from 'framer-motion'
import AddVoter from './AddVoter'
import RemoveVoter from './RemoveVoter'
import WorkflowManager from './WorkflowManager'
import PastResults from './PastResults'
import AbstainVote from './AbstainVote'
import UpdateVote from './UpdateVote'
import { useWorkflowStep } from '@/hooks/useWorkflowStep'
import VoterList from './VoterList'
import { useState, useEffect } from 'react'

export default function AdminDashboard() {
    const { step, isLoading, refetch } = useWorkflowStep()
    const [refreshKey, setRefreshKey] = useState(0)

    useEffect(() => {
        refetch()
        setRefreshKey((prev) => prev + 1)
    }, [step])

    const triggerRefresh = () => {
        setRefreshKey((prev) => prev + 1)
        refetch()
    }

    if (isLoading) return <p>⏳ Chargement...</p>

    return (
        <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
            key={refreshKey}
        >
            {step === 0 && (
                <div className="space-y-2">
                    <h2 className="text-lg font-semibold">Gestion des électeurs</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AddVoter onSuccess={triggerRefresh} />
                        <RemoveVoter onSuccess={triggerRefresh} />
                    </div>
                    <VoterList key={refreshKey} />
                </div>
            )}

            {step === 3 && (
                <div className="space-y-2">
                    <h2 className="text-lg font-semibold">Actions pendant le vote</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AbstainVote />
                        <UpdateVote />
                    </div>
                </div>
            )}

            <WorkflowManager key={refreshKey} />

            {step === 5 && (
                <div className="space-y-2">
                    <h2 className="text-lg font-semibold">Résultats finaux</h2>
                    <PastResults />
                </div>
            )}
        </motion.section>
    )
}