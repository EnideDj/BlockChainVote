'use client'

import { motion } from 'framer-motion'
import WorkflowStatus from '@/components/Shared/WorkflowStatus'
import Link from 'next/link'
import { useIsAdmin } from '@/hooks/useIsAdmin'

export default function HomePage() {
    const { isAdmin } = useIsAdmin()

    return (
        <main className="max-w-5xl mx-auto p-6 space-y-6">
            <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-3xl font-bold"
            >
                BlockChain Vote
            </motion.h1>

            <WorkflowStatus />

            <div className="flex flex-wrap gap-4">
                <Link
                    href="/voter"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Accéder à l'espace électeur
                </Link>

                {isAdmin && (
                    <Link
                        href="/admin"
                        className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
                    >
                        Accéder à l'espace admin
                    </Link>
                )}
            </div>
        </main>
    )
}