'use client'

import SubmitProposal from './SubmitProposal'
import VoteProposal from './VoteProposal'
import ProposalList from '@/components/Shared/ProposalList'
import WinnerDisplay from '@/components/Shared/WinnerDisplay'
import { useWorkflowStep } from '@/hooks/useWorkflowStep'
import { motion } from 'framer-motion'
import { useState } from 'react'

export default function VoterDashboard() {
    const { step, isLoading } = useWorkflowStep()
    const [refreshKey, setRefreshKey] = useState(0)

    const handleRefresh = () => {
        setRefreshKey((prev) => prev + 1)
    }

    if (isLoading) {
        return <p className="text-center text-gray-500">Chargement de l’état du vote...</p>
    }

    return (
        <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            {step === 1 && <SubmitProposal onSuccess={handleRefresh} />}

            {step === 1 && <ProposalList key={refreshKey} />}

            {step === 3 && (
                <>
                    <VoteProposal onSuccess={handleRefresh} />
                    <ProposalList key={refreshKey} />
                </>
            )}

            {step === 5 && <WinnerDisplay />}
        </motion.section>
    )
}