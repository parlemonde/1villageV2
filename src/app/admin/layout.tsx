import { redirect } from 'next/navigation';

import { UserProvider } from '@/contexts/userContext';
import { getCurrentUser } from '@/server-functions/getCurrentUser';

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const user = await getCurrentUser();
    if (!user) {
        redirect('/login');
    }
    return (
        <UserProvider initialUser={user}>
            <main>{children}</main>
        </UserProvider>
    );
}
