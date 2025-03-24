'use client'

import { useState } from 'react'
import { useAccount, useConfig } from 'wagmi'
import { writeContract, waitForTransactionReceipt } from '@wagmi/core'
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/utils/constants'
import { motion } from 'framer-motion'

export default function SubmitProposal() {
    const [description, setDescription] = useState('')
    const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
    const config = useConfig()
    const { address } = useAccount()

    const handleSubmit = async () => {
        if (!description.trim()) return

        try {
            setStatus('pending')

            const txHash = await writeContract(config, {
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'registerProposal',
                args: [description],
                account: address,
            })

            await waitForTransactionReceipt(config, { hash: txHash })
            setStatus('success')
            setDescription('')
        } catch (err) {
            console.error('Erreur enregistrement proposition :', err)
            setStatus('error')
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-4 rounded-xl shadow-md"
        >
            <h2 className="text-lg font-semibold mb-2">📝 Soumettre une proposition</h2>

            <input
                type="text"
                placeholder="Décrivez votre idée..."
                className="w-full border px-3 py-2 rounded-md mb-3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />

            <button
                onClick={handleSubmit}
                disabled={status === 'pending'}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
            >
                {status === 'pending' ? '⏳ Envoi...' : '🚀 Soumettre'}
            </button>

            {status === 'success' && (
                <p className="text-green-600 mt-2">Proposition enregistrée avec succès !</p>
            )}
            {status === 'error' && (
                <p className="text-red-600 mt-2">Une erreur est survenue.</p>
            )}
        </motion.div>
    )
}