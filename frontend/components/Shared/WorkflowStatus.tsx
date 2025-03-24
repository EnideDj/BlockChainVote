'use client'

import { motion } from 'framer-motion'
import { useWorkflowStep } from '@/hooks/useWorkflowStep'
import { workflowSteps } from '@/utils/workflowSteps'
import {
    Users,
    FilePlus,
    Ban,
    Vote,
    Lock,
    CheckCircle2,
} from 'lucide-react'

const iconsMap = {
    Users,
    FilePlus,
    Ban,
    Vote,
    Lock,
    CheckCircle2,
}

export default function WorkflowStatus() {
    const { step, isLoading, isError } = useWorkflowStep()
    const current = workflowSteps[step]

    const getStatusColor = (step: number) => {
        switch (step) {
            case 0:
                return 'text-yellow-500'
            case 1:
                return 'text-blue-500'
            case 2:
                return 'text-orange-500'
            case 3:
                return 'text-indigo-500'
            case 4:
                return 'text-gray-700'
            case 5:
                return 'text-green-600'
            default:
                return 'text-black'
        }
    }

    const Icon =
        iconsMap[current?.icon as keyof typeof iconsMap] || Users

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-6 bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-200 rounded-2xl shadow-lg mb-6"
        >
            <h2 className="text-2xl font-bold mb-3">État actuel du vote</h2>

            {isLoading && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-gray-500"
                >
                    ⏳ Chargement de l’état...
                </motion.p>
            )}

            {isError && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-red-600 font-semibold"
                >
                    Une erreur est survenue lors de la récupération de l’état du vote.
                </motion.p>
            )}

            {!isLoading && !isError && current && (
                <motion.div
                    key={step}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className={`flex items-center gap-3 ${getStatusColor(step)}`}
                >
                    <Icon size={28} />
                    <div>
                        <p className="text-xl font-bold">{current.label}</p>
                        <p className="text-sm text-gray-600">{current.description}</p>
                    </div>
                </motion.div>
            )}
        </motion.div>
    )
}