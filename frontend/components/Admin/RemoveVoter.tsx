'use client'

import { useState } from 'react'
import { writeContract, waitForTransactionReceipt, readContract } from '@wagmi/core'
import { useAccount, useConfig } from 'wagmi'
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/utils/constants'
import { motion } from 'framer-motion'
import { useWorkflowStep } from '@/hooks/useWorkflowStep'

export default function RemoveVoter({ onSuccess }: { onSuccess?: () => void }) {
    const [address, setAddress] = useState('')
    const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
    const [errorMessage, setErrorMessage] = useState('')
    const config = useConfig()
    const { address: connectedWallet } = useAccount()
    const { step } = useWorkflowStep()

    const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(address)
    const canRemoveVoter = step === 0

    const handleRemove = async () => {
        if (!isValidAddress) {
            setStatus('error')
            setErrorMessage('Adresse Ethereum invalide.')
            return
        }

        if (!canRemoveVoter) {
            setStatus('error')
            setErrorMessage("Suppression non autorisée à cette étape.")
            return
        }

        try {
            setStatus('pending')
            setErrorMessage('')

            const isRegistered = await readContract(config, {
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'isRegisteredVoter',
                args: [address],
            })

            if (!isRegistered) {
                setStatus('error')
                setErrorMessage("Cet électeur n’est pas inscrit.")
                return
            }

            const txHash = await writeContract(config, {
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'removeVoter',
                args: [address],
                account: connectedWallet,
            })

            await waitForTransactionReceipt(config, { hash: txHash })

            setStatus('success')
            setAddress('')
            onSuccess?.()
        } catch {
            setStatus('error')
            setErrorMessage("Une erreur est survenue lors de la suppression.")
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-4 rounded-xl shadow-md border"
        >
            <h3 className="text-lg font-semibold mb-3">Retirer un électeur</h3>

            <input
                type="text"
                placeholder="Adresse Ethereum (0x...)"
                className="w-full border px-3 py-2 rounded-md mb-2 text-sm"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
            />

            <button
                onClick={handleRemove}
                className={`w-full px-4 py-2 rounded text-white ${
                    status === 'pending' ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                }`}
                disabled={status === 'pending'}
            >
                {status === 'pending' ? 'Suppression en cours...' : 'Supprimer'}
            </button>

            {status === 'error' && (
                <p className="text-red-600 mt-2">{errorMessage}</p>
            )}
            {status === 'success' && (
                <p className="text-green-600 mt-2">Électeur supprimé avec succès !</p>
            )}
        </motion.div>
    )
}
