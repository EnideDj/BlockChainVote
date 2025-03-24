'use client'

import { useState } from 'react'
import { useAccount, useConfig } from 'wagmi'
import { writeContract, waitForTransactionReceipt } from '@wagmi/core'
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/utils/constants'
import { motion } from 'framer-motion'

export default function AbstainVote() {
    const { address } = useAccount()
    const config = useConfig()
    const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')

    const handleAbstain = async () => {
        setStatus('pending')

        const txHash = await writeContract(config, {
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'abstain',
            args: [],
            account: address,
        })

        const receipt = await waitForTransactionReceipt(config, {
            hash: txHash,
            timeout: 60000
        })
        setStatus('success')

    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-4 rounded-xl shadow-md"
        >
            <h3 className="text-lg font-semibold mb-2">Abstention</h3>
            <p className="text-sm text-gray-600 mb-3">Vous pouvez choisir de ne pas voter.</p>

            <button
                onClick={handleAbstain}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 w-full"
                disabled={status === 'pending'}
            >
                {status === 'pending' ? '⏳ Envoi...' : 'M’abstenir'}
            </button>

            {status === 'success' && <p className="text-green-600 mt-2">Abstention enregistrée.</p>}
            {status === 'error' && <p className="text-red-600 mt-2">Une erreur est survenue.</p>}
        </motion.div>
    )
}