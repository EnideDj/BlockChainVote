'use client'
import { useWorkflowStep } from '@/hooks/useWorkflowStep'

export default function DebugWorkflow() {
    const { step, isLoading, isError } = useWorkflowStep()

    return (
        <div className="text-sm text-gray-600 mt-4">
            🧪 Étape actuelle (hook): {isLoading ? '⏳' : isError ? 'erreur' : step}
        </div>
    )
}