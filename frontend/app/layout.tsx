// app/layout.tsx
import '../styles/globals.css'
import { Web3Provider } from '@/wagmi'
import LayoutWithConnection from '@/components/Layout/LayoutWithConnection'

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="fr">
        <body>
        <Web3Provider>
            <LayoutWithConnection>
                {children}
            </LayoutWithConnection>
        </Web3Provider>
        </body>
        </html>
    )
}