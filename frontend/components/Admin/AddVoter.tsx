'use client'

import { useState } from 'react'
import { writeContract, readContract, waitForTransactionReceipt } from '@wagmi/core'
import { useAccount, useConfig } from 'wagmi'
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/utils/constants'
import { motion } from 'framer-motion'
import { useWorkflowStep } from '@/hooks/useWorkflowStep'

export default function AddVoter({ onSuccess }: { onSuccess?: () => void }) {
    const [address, setAddress] = useState('')
    const [status, setStatus] = useState<'idle' | 'pending'>('idle')
    const config = useConfig()
    const { address: connectedWallet } = useAccount()
    const { step } = useWorkflowStep()

    const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(address)
    const canAddVoter = step === 0

    const handleAdd = async () => {
        if (!isValidAddress) return console.log("Adresse Ethereum invalide.")
        if (!canAddVoter) return console.log("Étape invalide pour ajouter un électeur.")

        try {
            setStatus('pending')

            const alreadyRegistered = await readContract(config, {
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'isRegisteredVoter',
                args: [address],
            })

            if (alreadyRegistered) {
                setStatus('idle')
                return console.log('Cet électeur est déjà inscrit.')
            }

            console.log('📡 Envoi de la transaction...')

            const txHash = await writeContract(config, {
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'registerVoter',
                args: [address],
                account: connectedWallet,
            })

            await waitForTransactionReceipt(config, { hash: txHash })

            setAddress('')
            onSuccess?.()
        } catch (err: any) {
            console.error('Erreur ajout électeur :', err)
        } finally {
            setStatus('idle')
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-4 rounded-xl shadow-md border"
        >
            <h3 className="text-lg font-semibold mb-3">👤 Ajouter un électeur</h3>

            <input
                type="text"
                placeholder="Adresse Ethereum (0x...)"
                className="w-full border px-3 py-2 rounded-md mb-2 text-sm"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
            />

            <button
                onClick={handleAdd}
                className={`w-full px-4 py-2 rounded text-white ${
                    status === 'pending' ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
                disabled={status === 'pending'}
            >
                {status === 'pending' ? '⏳ Ajout en cours...' : '➕ Ajouter'}
            </button>
        </motion.div>
    )
}
