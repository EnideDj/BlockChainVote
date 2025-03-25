'use client'

import { useState } from 'react'
import { writeContract, readContract, waitForTransactionReceipt } from '@wagmi/core'
import { useAccount, useConfig } from 'wagmi'
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/utils/constants'
import { motion } from 'framer-motion'
import { useWorkflowStep } from '@/hooks/useWorkflowStep'

export default function AddVoter({ onSuccess }: { onSuccess?: () => void }) {
    const [address, setAddress] = useState('')
    const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
    const [errorMessage, setErrorMessage] = useState('')
    const config = useConfig()
    const { address: connectedWallet } = useAccount()
    const { step } = useWorkflowStep()

    const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(address)
    const canAddVoter = step === 0

    const handleAdd = async () => {
        if (!isValidAddress) return setErrorMessage("Adresse Ethereum invalide.")
        if (!canAddVoter) return setErrorMessage("Étape invalide pour ajouter un électeur.")

        try {
            setStatus('pending')
            setErrorMessage('')

            const alreadyRegistered = await readContract(config, {
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'isRegisteredVoter',
                args: [address],
            })

            if (alreadyRegistered) {
                setStatus('error')
                return setErrorMessage('Cet électeur est déjà inscrit.')
            }

            const txHash = await writeContract(config, {
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'registerVoter',
                args: [address],
                account: connectedWallet,
            })

            await waitForTransactionReceipt(config, { hash: txHash })

            setAddress('')
            setStatus('success')
            onSuccess?.()
        } catch (err: any) {
            setStatus('error')
            setErrorMessage(err?.message || 'Erreur inattendue.')
        } finally {
            setTimeout(() => setStatus('idle'), 3000)
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

            {status === 'error' && (
                <p className="text-red-600 mt-2">{errorMessage}</p>
            )}
            {status === 'success' && (
                <p className="text-green-600 mt-2">Électeur ajouté avec succès !</p>
            )}
        </motion.div>
    )
}
