'use client'

import Link from 'next/link'
import { useAccount } from 'wagmi'
import { useIsAdmin } from '@/hooks/useIsAdmin'
import ConnectWallet from './ConnectWallet'
import { motion } from 'framer-motion'

export default function NavBar() {
    const { address, isConnected } = useAccount()
    const { isAdmin } = useIsAdmin()

    return (
        <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white border-b px-4 py-3 flex justify-between items-center shadow-sm"
        >
            <div className="flex items-center gap-4 font-medium">
                <Link href="/" className="hover:text-blue-600">Accueil</Link>
                {isConnected && (
                    <>
                        <Link href="/voter" className="hover:text-blue-600">Voter</Link>
                        {isAdmin && (
                            <Link href="/admin" className="hover:text-blue-600">Admin</Link>
                        )}
                    </>
                )}
            </div>

            <div className="flex items-center gap-4">
                {isConnected && (
                    <span className="text-sm text-gray-600 hidden md:block">
                        Connecté en tant que <strong>{isAdmin ? 'ADMIN' : 'ÉLECTEUR'}</strong>
                    </span>
                )}
                <ConnectWallet />
            </div>
        </motion.nav>
    )
}