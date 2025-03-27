'use client'

import { useEffect, useState } from 'react'
import { readContract } from '@wagmi/core'
import { useAccount, useConfig } from 'wagmi'
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/utils/constants'

export default function WinnerDisplay({ refreshKey }: { refreshKey?: number }) {
    const [winners, setWinners] = useState<{ description: string; voteCount: bigint }[]>([])
    const [loading, setLoading] = useState(true)

    const config = useConfig()
    const { address } = useAccount()

    useEffect(() => {
        const fetchWinners = async () => {
            try {
                const data = await readContract(config, {
                    address: CONTRACT_ADDRESS,
                    abi: CONTRACT_ABI,
                    functionName: 'getWinners',
                    account: address,
                })

                console.log('🏆 Gagnants récupérés depuis le contrat :', data)

                setWinners(data as any)
            } catch (err) {
                console.error('❌ Erreur récupération gagnant :', err)
            } finally {
                setLoading(false)
            }
        }

        fetchWinners()
    }, [refreshKey])

    return (
        <div className="bg-white p-4 rounded-xl shadow-md my-4">
            <h2 className="text-xl font-bold mb-3">🎉 Gagnant du vote</h2>
            {loading ? (
                <p className="text-gray-500">Chargement...</p>
            ) : winners.length === 0 ? (
                <p className="text-gray-400">Aucun gagnant enregistré.</p>
            ) : (
                <ul className="space-y-2">
                    {winners.map((w, i) => (
                        <li
                            key={i}
                            className="border p-3 rounded-md bg-green-50 flex justify-between items-center"
                        >
                            <span className="font-medium">{w.description}</span>
                            <span className="text-sm text-gray-700">{w.voteCount.toString()} vote(s)</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}