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

export default function VoteProposal({ onSuccess }: { onSuccess?: () => void }) {
    const [proposals, setProposals] = useState<Proposal[]>([])
    const [voterVotes, setVoterVotes] = useState<Record<number, boolean>>({})
    const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
    const config = useConfig()
    const { address } = useAccount()

    const fetchProposals = async () => {
        const result = await readContract(config, {
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'getAllProposals',
            account: address,
        })
        setProposals(result as Proposal[])
    }

    const fetchVoterVotes = async () => {
        const votes: Record<number, boolean> = {}
        for (let i = 0; i < proposals.length; i++) {
            try {
                const voted = await readContract(config, {
                    address: CONTRACT_ADDRESS,
                    abi: CONTRACT_ABI,
                    functionName: 'hasVotedFor',
                    args: [address, i],
                    account: address,
                })
                votes[i] = Boolean(voted)
            } catch {
                votes[i] = false
            }
        }
        setVoterVotes(votes)
    }

    const handleToggleVote = async (proposalId: number) => {
        if (status === 'pending') return;

        try {
            setStatus('pending');

            const hasVoted = voterVotes[proposalId];
            const txHash = await writeContract(config, {
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: hasVoted ? 'removeVote' : 'vote',
                args: [proposalId],
                account: address,
            });

            await waitForTransactionReceipt(config, { hash: txHash });

            setTimeout(async () => {
                await fetchProposals();
                await fetchVoterVotes();
                onSuccess?.();
                setStatus('success');
                setTimeout(() => setStatus('idle'), 3000);
            }, 1000);

        } catch (err) {
            console.error('Erreur vote/removeVote :', err);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    useEffect(() => {
        fetchProposals()
    }, [])

    useEffect(() => {
        if (proposals.length > 0) {
            fetchVoterVotes()
        }
    }, [proposals])

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-4 rounded-xl shadow-md"
        >
            <h2 className="text-lg font-semibold mb-3">Votez pour les propositions</h2>

            <ul className="space-y-3 mb-4">
                {proposals.map((proposal, index) => {
                    const hasVoted = voterVotes[index]

                    return (
                        <li
                            key={index}
                            className={`border p-3 rounded-md flex flex-col gap-2 transition-all ${
                                hasVoted
                                    ? 'bg-green-100 border-green-500'
                                    : 'hover:bg-gray-50 border-gray-300'
                            }`}
                        >
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-800">{proposal.description}</span>
                                <span className="text-sm text-gray-500">{proposal.voteCount.toString()} vote(s)</span>
                            </div>

                            <button
                                disabled={status === 'pending'}
                                onClick={() => handleToggleVote(index)}
                                className={`text-white px-3 py-1 rounded text-sm transition-colors ${
                                    voterVotes[index]
                                        ? 'bg-red-600 hover:bg-red-700'   // Retirer
                                        : 'bg-blue-600 hover:bg-blue-700'  // Voter
                                }`}
                            >
                                {voterVotes[index] ? '❌ Retirer mon vote' : '🗳 Voter'}
                            </button>
                        </li>
                    )
                })}
            </ul>

            {status === 'success' && (
                <p className="text-green-600 mt-3">✅ Action réussie !</p>
            )}
            {status === 'error' && (
                <p className="text-red-600 mt-3">❌ Une erreur est survenue.</p>
            )}
        </motion.div>
    )
}