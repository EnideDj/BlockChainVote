'use client'

import { useEffect, useState } from 'react'
import { readContract } from '@wagmi/core'
import { useAccount, useConfig } from 'wagmi'
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/utils/constants'
import { History, Trophy } from 'lucide-react'

type Result = {
    winningProposalId: bigint
    winningProposalDescription: string
    winningVoteCount: bigint
    totalProposals: bigint
}

export default function PastResults() {
    const [results, setResults] = useState<Result[]>([])
    const [loading, setLoading] = useState(true)

    const config = useConfig()
    const { address } = useAccount()

    useEffect(() => {
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
                console.error('Erreur résultats précédents :', err)
            } finally {
                setLoading(false)
            }
        }

        fetchResults()
    }, [])

    return (
        <div className="bg-white p-4 rounded-xl shadow-md my-4">
            <div className="flex items-center gap-2 mb-3">
                <History className="text-blue-600" size={20} />
                <h2 className="text-xl font-bold">Historique des votes</h2>
            </div>

            {loading ? (
                <p className="text-gray-500">Chargement...</p>
            ) : results.length === 0 ? (
                <p className="text-gray-400">Aucun résultat précédent trouvé.</p>
            ) : (
                <ul className="space-y-3">
                    {results.map((res, idx) => (
                        <li
                            key={idx}
                            className="border p-3 rounded-md bg-gray-50 shadow-sm hover:shadow transition"
                        >
                            <div className="flex items-center gap-2">
                                <Trophy className="text-yellow-600" size={18} />
                                <p className="font-medium">
                                    {res.winningProposalDescription} avec{' '}
                                    <strong>{res.winningVoteCount.toString()} vote(s)</strong>
                                </p>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                Total propositions : {res.totalProposals.toString()}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}