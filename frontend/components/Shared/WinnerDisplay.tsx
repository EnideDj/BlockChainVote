'use client'

import { useEffect, useState } from 'react'
import { useConfig, useAccount } from 'wagmi'
import { readContract } from '@wagmi/core'
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/utils/constants'
import { motion } from 'framer-motion'

type Proposal = {
    description: string
    voteCount: bigint
}

export default function WinnerDisplay() {
    const config = useConfig()
    const { address } = useAccount()
    const [winners, setWinners] = useState<Proposal[]>([])
    const [loading, setLoading] = useState(true)

    const fetchWinners = async () => {
        try {
            const data = await readContract(config, {
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'getWinners',
                account: address,
            })

            setWinners(data as Proposal[])
        } catch (err) {
            console.error('Erreur chargement des gagnants :', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchWinners()
    }, [])

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white p-4 rounded-xl shadow-md"
        >
            <h2 className="text-xl font-bold mb-3">🏆 Résultat du vote</h2>

            {loading ? (
                <p>⏳ Chargement...</p>
            ) : winners.length === 0 ? (
                <p className="text-gray-600">Aucun gagnant trouvé.</p>
            ) : (
                <ul className="space-y-2">
                    {winners.map((winner, index) => (
                        <li
                            key={index}
                            className="bg-green-100 border border-green-300 rounded-md p-3 flex justify-between items-center"
                        >
                            <span>🎉 {winner.description}</span>
                            <span className="text-sm text-gray-700">
                {winner.voteCount.toString()} vote(s)
              </span>
                        </li>
                    ))}
                </ul>
            )}
        </motion.div>
    )
}