'use client'

import { useAccount } from 'wagmi'
import { ADMIN_ADDRESS } from '@/utils/constants'

export function useIsAdmin() {
    const { address, isConnected } = useAccount()
    const isAdmin = isConnected && address?.toLowerCase() === ADMIN_ADDRESS.toLowerCase()

    return { isAdmin, isConnected }
}