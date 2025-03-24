'use client'

import { useState, useEffect } from 'react'
import { useAccount, useConfig } from 'wagmi'
import { readContract, writeContract, waitForTransactionReceipt } from '@wagmi/core'
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/utils/constants'
import { motion } from 'framer-motion'

type Proposal = {
    description: string
    voteCount: bigint
}

export default function UpdateVote() {
    const { address } = useAccount()
    const config = useConfig()
    const [proposals, setProposals] = useState<Proposal[]>([])
    const [selected, setSelected] = useState<number | null>(null)
    const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')

    const fetchProposals = async () => {
        try {
            const all = await readContract(config, {
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'getAllProposals',
                account: address,
            })
            setProposals(all as Proposal[])
        } catch (err) {
            console.error('Erreur chargement propositions :', err)
        }
    }

    const handleUpdate = async () => {
        if (selected === null) return

        try {
            setStatus('pending')

            const txHash = await writeContract(config, {
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'updateVote',
                args: [selected],
                account: address,
            })

            await waitForTransactionReceipt(config, { hash: txHash })
            setStatus('success')
        } catch (err) {
            console.error('Erreur mise à jour vote :', err)
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
            <h3 className="text-lg font-semibold mb-3">🔁 Modifier mon vote</h3>

            <ul className="space-y-2 mb-4">
                {proposals.map((proposal, index) => (
                    <li
                        key={index}
                        onClick={() => setSelected(index)}
                        className={`cursor-pointer border p-3 rounded-md ${
                            selected === index ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-50'
                        }`}
                    >
                        {proposal.description}
                    </li>
                ))}
            </ul>

            <button
                onClick={handleUpdate}
                disabled={selected === null || status === 'pending'}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 w-full"
            >
                {status === 'pending' ? 'En cours...' : 'Mettre à jour mon vote'}
            </button>

            {status === 'success' && (
                <p className="text-green-600 mt-2">Vote mis à jour avec succès !</p>
            )}
            {status === 'error' && <p className="text-red-600 mt-2">Une erreur est survenue.</p>}
        </motion.div>
    )
}