'use client'

import { useEffect, useState } from 'react'
import { readContract } from '@wagmi/core'
import { useConfig } from 'wagmi'
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/utils/constants'
import { motion } from 'framer-motion'

type Result = {
    winningProposalId: bigint
    winningProposalDescription: string
    winningVoteCount: bigint
    totalProposals: bigint
}

export default function PastResultsPage() {
    const [results, setResults] = useState<Result[]>([])
    const [loading, setLoading] = useState(true)
    const config = useConfig()

    const fetchResults = async () => {
        try {
            const data = await readContract(config, {
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'getPastResults',
            })

            setResults(data as Result[])
        } catch (err) {
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
                className="text-3xl font-bold"
            >
                📜 Résultats des votes précédents
            </motion.h1>

            {loading ? (
                <p className="text-gray-500">Chargement des résultats...</p>
            ) : results.length === 0 ? (
                <p className="text-gray-400">Aucun vote comptabilisé jusqu’à présent.</p>
            ) : (
                <div className="space-y-4">
                    {results.map((res, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="border p-4 rounded-lg bg-white shadow-md"
                        >
                            <h2 className="font-semibold text-lg mb-1">🗳️ Session #{index + 1}</h2>
                            <p><strong>ID gagnant :</strong> {res.winningProposalId.toString()}</p>
                            <p><strong>Description :</strong> {res.winningProposalDescription}</p>
                            <p><strong>Votes :</strong> {res.winningVoteCount.toString()}</p>
                            <p><strong>Propositions totales :</strong> {res.totalProposals.toString()}</p>
                        </motion.div>
                    ))}
                </div>
            )}
        </main>
    )
}