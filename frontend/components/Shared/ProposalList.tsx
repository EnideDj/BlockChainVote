'use client'

import { useEffect, useState } from 'react'
import { useAccount, useConfig } from 'wagmi'
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/utils/constants'
import { readContract } from '@wagmi/core'

type Proposal = {
    description: string
    voteCount: bigint
}

export default function ProposalList() {
    const [proposals, setProposals] = useState<Proposal[]>([])
    const [loading, setLoading] = useState(true)
    const config = useConfig()
    const { address } = useAccount()

    const fetchProposals = async () => {
        try {
            setLoading(true)

            const total = await readContract(config, {
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'getProposalsCount',
                account: address,
            })

            const count = Number(total)
            const temp: Proposal[] = []

            for (let i = 0; i < count; i++) {
                const proposal = await readContract(config, {
                    address: CONTRACT_ADDRESS,
                    abi: CONTRACT_ABI,
                    functionName: 'proposals',
                    args: [i],
                    account: address,
                })
                temp.push(proposal as Proposal)
            }

            setProposals(temp)
        } catch {
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProposals()
    }, [])

    return (
        <div className="bg-white p-4 rounded-xl shadow-md my-4">
            <h2 className="text-xl font-bold mb-3">📋 Propositions enregistrées</h2>
            {loading ? (
                <p className="text-gray-500">Chargement...</p>
            ) : proposals.length === 0 ? (
                <p className="text-gray-400">Aucune proposition disponible.</p>
            ) : (
                <ul className="space-y-2">
                    {proposals.map((proposal, index) => (
                        <li
                            key={index}
                            className="border p-3 rounded-md bg-gray-50 flex justify-between items-center"
                        >
                            <span>{proposal.description}</span>
                            <span className="text-sm text-gray-600">{proposal.voteCount.toString()} votes</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}