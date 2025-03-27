import { useAccount, useContractRead } from 'wagmi'
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/utils/constants'

const { address } = useAccount()

const { data, isLoading, isError } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getVoter',
    args: [address],
})