'use client'

import VoterDashboard from '@/components/Voter/VoterDashboard'
import WorkflowStatus from '@/components/Shared/WorkflowStatus'
import { useIsVoter } from '@/hooks/useIsVoter'
import { useIsAdmin } from '@/hooks/useIsAdmin'
import { motion } from 'framer-motion'

export default function VoterPage() {
    const { isConnected, isRegistered, isLoading } = useIsVoter()
    const { isAdmin } = useIsAdmin()

    if (!isConnected) {
        return (
            <div className="p-6 text-center">
                <h2 className="text-xl font-bold mb-2">Wallet requis</h2>
                <p className="text-gray-600">Veuillez connecter votre wallet pour accéder à cet espace.</p>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="p-6 text-center text-gray-500">
                ⏳ Vérification de votre statut d’électeur...
            </div>
        )
    }

    if (!isRegistered && !isAdmin) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="p-6 text-center text-red-600 font-medium"
            >
                Vous n’êtes pas inscrit sur la liste des électeurs. Veuillez contacter l’administrateur.
            </motion.div>
        )
    }

    return (
        <main className="max-w-5xl mx-auto p-6 space-y-6">
            <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-3xl font-bold"
            >
                Espace Électeur
            </motion.h1>

            <WorkflowStatus />

            <VoterDashboard />
        </main>
    )
}