'use client'

import { useEffect, useState } from 'react'
import { useAccount, useConfig } from 'wagmi'
import { readContract, writeContract, waitForTransactionReceipt } from '@wagmi/core'
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/utils/constants'
import { motion } from 'framer-motion'
import { Trash2, Loader2, Users } from 'lucide-react'

export default function VoterList({ refresh }: { refresh: number }) {
    const config = useConfig()
    const { address: admin } = useAccount()
    const [voters, setVoters] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [confirming, setConfirming] = useState<string | null>(null)
    const [removing, setRemoving] = useState<string | null>(null)

    const fetchVoters = async () => {
        setLoading(true)
        try {
            const data = await readContract(config, {
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'getAllVoters',
                account: admin,
            })
            setVoters(data as string[])
        } catch {
            setError("Impossible de récupérer les électeurs.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchVoters()
    }, [refresh])

    const handleRemove = async (addr: string) => {
        setRemoving(addr)
        try {
            const tx = await writeContract(config, {
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'removeVoter',
                args: [addr],
                account: admin,
            })

            await waitForTransactionReceipt(config, { hash: tx })
            setVoters((prev) => prev.filter((v) => v !== addr))
        } catch {
            setError("Erreur lors de la suppression.")
        } finally {
            setRemoving(null)
            setConfirming(null)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white p-4 rounded-xl shadow-md border"
        >
            <div className="flex items-center gap-2 mb-4">
                <Users className="text-blue-600" size={20} />
                <h3 className="text-lg font-semibold">Liste des électeurs</h3>
            </div>

            {loading && (
                <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="animate-spin" size={16} />
                    Chargement...
                </div>
            )}

            {error && <p className="text-red-600">{error}</p>}

            {!loading && voters.length === 0 && (
                <p className="text-gray-500">Aucun électeur enregistré.</p>
            )}

            <ul className="divide-y text-sm">
                {voters.map((addr) => (
                    <li key={addr} className="flex justify-between items-center py-2">
                        <span className="truncate">{addr}</span>

                        {confirming === addr ? (
                            <div className="flex gap-2 text-xs">
                                <button
                                    onClick={() => handleRemove(addr)}
                                    disabled={removing === addr}
                                    className="text-red-600 hover:underline"
                                >
                                    {removing === addr ? (
                                        <span className="flex items-center gap-1">
                                            <Loader2 size={14} className="animate-spin" />
                                            Suppression...
                                        </span>
                                    ) : (
                                        'Oui'
                                    )}
                                </button>
                                <button
                                    onClick={() => setConfirming(null)}
                                    className="text-gray-500 hover:underline"
                                >
                                    Annuler
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setConfirming(addr)}
                                className="text-red-600 hover:text-red-800"
                                title="Supprimer cet électeur"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </motion.div>
    )
}