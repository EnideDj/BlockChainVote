'use client'

import { useState, useEffect } from 'react'
import { writeContract, waitForTransactionReceipt, readContract } from '@wagmi/core'
import { useAccount, useConfig } from 'wagmi'
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/utils/constants'
import { motion } from 'framer-motion'
import { useWorkflowStep } from '@/hooks/useWorkflowStep'
import { UserMinus, Loader2, Check, AlertCircle } from 'lucide-react'

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

    useEffect(() => {
        if (status === 'success' || status === 'error') {
            const timer = setTimeout(() => setStatus('idle'), 3000)
            return () => clearTimeout(timer)
        }
    }, [status])

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-4 rounded-xl shadow-md border"
        >
            <div className="flex items-center gap-2 mb-3">
                <UserMinus className="text-red-600" size={20} />
                <h3 className="text-lg font-semibold">Retirer un électeur</h3>
            </div>

            <input
                type="text"
                placeholder="Adresse Ethereum (0x...)"
                className="w-full border px-3 py-2 rounded-md mb-2 text-sm"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
            />

            <button
                onClick={handleRemove}
                className={`w-full px-4 py-2 rounded text-white flex items-center justify-center gap-2 ${
                    status === 'pending' ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                }`}
                disabled={status === 'pending'}
            >
                {status === 'pending' ? (
                    <>
                        <Loader2 className="animate-spin" size={16} />
                        Suppression en cours...
                    </>
                ) : (
                    '🗑️ Supprimer'
                )}
            </button>

            {status === 'error' && (
                <div className="flex items-center text-red-600 mt-2 text-sm gap-2">
                    <AlertCircle size={16} />
                    <p>{errorMessage}</p>
                </div>
            )}

            {status === 'success' && (
                <div className="flex items-center text-green-600 mt-2 text-sm gap-2">
                    <Check size={16} />
                    <p>Électeur supprimé avec succès !</p>
                </div>
            )}
        </motion.div>
    )
}