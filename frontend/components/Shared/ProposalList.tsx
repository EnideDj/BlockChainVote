'use client'

import { useEffect, useState } from 'react'
import { useAccount, useConfig } from 'wagmi'
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/utils/constants'
import { readContract } from '@wagmi/core'

type Proposal = {
    description: string
    voteCount: bigint
}

export default function ProposalList({ refreshKey }: { refreshKey?: number }) {
    const [proposals, setProposals] = useState<Proposal[]>([])
    const [loading, setLoading] = useState(true)
    const config = useConfig()
    const { address } = useAccount()

    const fetchProposals = async () => {
        try {
            setLoading(true)

            const list = await readContract(config, {
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'getAllProposals',
                account: address,
            })

            console.log('📋 Propositions fetchées :', list)
            setProposals(list as Proposal[])
        } catch  {
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProposals()
    }, [refreshKey])

    return (
        <div className="bg-white p-4 rounded-xl shadow-md my-4">
            <h2 className="text-xl font-bold mb-3">Propositions enregistrées</h2>
            {loading ? (
                <p className="text-gray-500">Chargement...</p>
            ) : proposals.length === 0 ? (
                <p className="text-gray-400">Aucune proposition pour le moment.</p>
            ) : (
                <ul className="space-y-2">
                    {proposals.map((proposal, index) => (
                        <li
                            key={index}
                            className="border p-3 rounded-md bg-gray-50 flex justify-between items-center"
                        >
                            <span>{proposal.description}</span>
                            <span className="text-sm text-gray-600">
                                {proposal.voteCount.toString()} vote(s)
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}