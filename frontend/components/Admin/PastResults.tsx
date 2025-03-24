'use client'

import { useEffect, useState } from 'react'
import { useConfig, useAccount } from 'wagmi'
import { readContract } from '@wagmi/core'
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/utils/constants'
import { motion } from 'framer-motion'

type Result = {
    winningProposalId: bigint
    winningProposalDescription: string
    winningVoteCount: bigint
    totalProposals: bigint
}

export default function PastResults() {
    const config = useConfig()
    const { address } = useAccount()
    const [results, setResults] = useState<Result[]>([])
    const [loading, setLoading] = useState(true)

    const fetchResults = async () => {
        try {
            const data = await readContract(config, {
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'getPastResults',
                account: address,
            })

            setResults(data as Result[])
        } catch (err) {
            console.error('Erreur historique des votes :', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchResults()
    }, [])

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white p-4 rounded-xl shadow-md"
        >
            <h3 className="text-lg font-semibold mb-3">📚 Historique des votes</h3>

            {loading ? (
                <p>Chargement...</p>
            ) : results.length === 0 ? (
                <p className="text-gray-500">Aucun vote précédent.</p>
            ) : (
                <ul className="space-y-3">
                    {results.map((res, idx) => (
                        <li
                            key={idx}
                            className="p-3 border border-gray-200 rounded-md bg-gray-50"
                        >
                            <p className="font-medium">📝 {res.winningProposalDescription}</p>
                            <p className="text-sm text-gray-600">
                                🏆 {res.winningVoteCount.toString()} vote(s) – {res.totalProposals.toString()} propositions
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </motion.div>
    )
}