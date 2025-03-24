'use client'

import AdminDashboard from '@/components/Admin/AdminDashboard'
import WorkflowStatus from '@/components/Shared/WorkflowStatus'
import { useIsAdmin } from '@/hooks/useIsAdmin'
import { motion } from 'framer-motion'

export default function AdminPage() {
    const { isAdmin } = useIsAdmin()

    return (
        <main className="max-w-5xl mx-auto p-6 space-y-6">
            <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-3xl font-bold"
            >
                🧑‍💼 Interface Administrateur
            </motion.h1>

            {!isAdmin ? (
                <p className="text-red-600 font-medium">
                    Vous n’êtes pas autorisé à accéder à cet espace.
                </p>
            ) : (
                <>
                    <AdminDashboard />
                </>
            )}
        </main>
    )
}