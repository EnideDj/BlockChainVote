'use client'

import { useState } from 'react'
import { writeContract, readContract, waitForTransactionReceipt } from '@wagmi/core'
import { useAccount, useConfig } from 'wagmi'
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/utils/constants'
import { motion } from 'framer-motion'
import { useWorkflowStep } from '@/hooks/useWorkflowStep'
import { UserPlus, Loader2, CheckCircle, AlertCircle, Ban } from 'lucide-react'

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
            <div className="flex items-center gap-2 mb-3">
                <UserPlus className="text-blue-600" />
                <h3 className="text-lg font-semibold">Ajouter un électeur</h3>
            </div>

            <input
                type="text"
                placeholder="Adresse Ethereum (0x...)"
                className="w-full border px-3 py-2 rounded-md mb-2 text-sm"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
            />

            <button
                onClick={handleAdd}
                className={`w-full px-4 py-2 rounded text-white flex items-center justify-center gap-2 ${
                    status === 'pending' || !canAddVoter
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                }`}
                disabled={status === 'pending' || !canAddVoter}
            >
                {status === 'pending' ? <Loader2 className="animate-spin" /> : <UserPlus />}
                {status === 'pending' ? 'Ajout en cours...' : 'Ajouter'}
            </button>

            {status === 'error' && (
                <p className="text-red-600 mt-2 flex items-center gap-1 text-sm">
                    <AlertCircle size={16} /> {errorMessage}
                </p>
            )}
            {status === 'success' && (
                <p className="text-green-600 mt-2 flex items-center gap-1 text-sm">
                    <CheckCircle size={16} /> Électeur ajouté avec succès !
                </p>
            )}
            {!canAddVoter && (
                <p className="text-yellow-600 mt-2 text-sm flex items-center gap-1">
                    <Ban size={16} /> Vous ne pouvez plus ajouter d’électeurs à cette étape.
                </p>
            )}
        </motion.div>
    )
}