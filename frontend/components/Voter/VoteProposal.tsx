'use client'

import { useEffect, useState } from 'react'
import { useAccount, useConfig } from 'wagmi'
import { readContract, writeContract, waitForTransactionReceipt } from '@wagmi/core'
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/utils/constants'
import { motion } from 'framer-motion'

type Proposal = {
    description: string
    voteCount: bigint
}

export default function VoteProposal() {
    const [proposals, setProposals] = useState<Proposal[]>([])
    const [selected, setSelected] = useState<number | null>(null)
    const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
    const config = useConfig()
    const { address } = useAccount()

    const fetchProposals = async () => {
        try {
            const result = await readContract(config, {
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'getAllProposals',
                account: address,
            })

            setProposals(result as Proposal[])
        } catch {}
    }

    const handleVote = async () => {
        if (selected === null) return

        try {
            setStatus('pending')

            const txHash = await writeContract(config, {
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'vote',
                args: [selected],
                account: address,
            })

            await waitForTransactionReceipt(config, { hash: txHash })
            setStatus('success')
        } catch (error) {
            setStatus('error')
        }
    }

    useEffect(() => {
        fetchProposals()
    }, [])

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-4 rounded-xl shadow-md"
        >
            <h2 className="text-lg font-semibold mb-3"> Voter pour une proposition</h2>

            <ul className="space-y-2 mb-4">
                {proposals.map((proposal, index) => (
                    <li
                        key={index}
                        onClick={() => setSelected(index)}
                        className={`cursor-pointer border p-3 rounded-md flex justify-between items-center ${
                            selected === index ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-50'
                        }`}
                    >
                        <span>{proposal.description}</span>
                        <span className="text-sm text-gray-500">{proposal.voteCount.toString()} votes</span>
                    </li>
                ))}
            </ul>

            <button
                onClick={handleVote}
                disabled={selected === null || status === 'pending'}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
            >
                {status === 'pending' ? '⏳ Vote en cours...' : 'Voter'}
            </button>

            {status === 'success' && (
                <p className="text-green-600 mt-2">Vote enregistré avec succès !</p>
            )}
            {status === 'error' && (
                <p className="text-red-600 mt-2">Une erreur est survenue.</p>
            )}
        </motion.div>
    )
}