'use client'

import { useEffect, useState } from 'react'
import { readContract } from '@wagmi/core'
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/utils/constants'
import { useConfig } from 'wagmi'
import { motion } from 'framer-motion'

type VotingResult = {
    winningProposalId: bigint
    winningProposalDescription: string
    winningVoteCount: bigint
    totalProposals: bigint
}

export default function PublicResultsPage() {
    const [results, setResults] = useState<VotingResult[]>([])
    const [loading, setLoading] = useState(true)
    const config = useConfig()

    const fetchResults = async () => {
        try {
            setLoading(true)
            const data = await readContract(config, {
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'getPastResults',
            })
            setResults(data as VotingResult[])
        } catch (err) {
            console.error('Erreur récupération résultats :', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchResults()
    }, [])

    return (
        <main className="max-w-4xl mx-auto p-6 space-y-6">
            <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-2xl font-bold"
            >
                Historique des Votes
            </motion.h1>

            {loading ? (
                <p>Chargement des anciens résultats...</p>
            ) : results.length === 0 ? (
                <p className="text-gray-500">Aucun vote enregistré pour l'instant.</p>
            ) : (
                <ul className="space-y-4">
                    {results.map((r, i) => (
                        <li key={i} className="p-4 rounded-md border bg-white shadow">
                            <p className="font-medium">🏆 Proposition gagnante : {r.winningProposalDescription}</p>
                            <p>ID : {r.winningProposalId.toString()}</p>
                            <p>Votes : {r.winningVoteCount.toString()}</p>
                            <p>Propositions au total : {r.totalProposals.toString()}</p>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    )
}
