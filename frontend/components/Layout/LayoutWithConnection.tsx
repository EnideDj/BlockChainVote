'use client'

import { useEffect, useState } from 'react'
import { useIsAdmin } from '@/hooks/useIsAdmin'
import ConnectWallet from '@/components/Shared/ConnectWallet'
import NavBar from '@/components/Shared/NavBar'

export default function LayoutWithConnection({ children }: { children: React.ReactNode }) {
    const { isConnected } = useIsAdmin()
    const [hasMounted, setHasMounted] = useState(false)

    useEffect(() => {
        setHasMounted(true)
    }, [])

    if (!hasMounted) return null

    if (!isConnected) {
        return (
            <div className="h-screen flex flex-col items-center justify-center text-center space-y-4">
                <h1 className="text-2xl font-bold">BlockChain Vote</h1>
                <p className="text-gray-600">Connectez votre wallet pour accéder à l'application.</p>
                <ConnectWallet />
            </div>
        )
    }

    return (
        <>
            <NavBar />
            <div className="pt-4">{children}</div>
        </>
    )
}