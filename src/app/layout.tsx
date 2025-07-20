import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: '1Village',
    description: '1Village',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr">
            <body>{children}</body>
        </html>
    );
}
