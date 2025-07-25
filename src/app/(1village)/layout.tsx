import { redirect } from 'next/navigation';

import { Header } from './Header';
import { Navigation } from './Navigation';
import { Phases } from './Phases';
import styles from './layout.module.css';
import { Flex } from '@/components/layout/Flex';
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
            <Header />
            <Flex justifyContent="flex-start" alignItems="stretch" className={styles.rootLayout}>
                <Navigation />
                <Flex isFullWidth flexDirection="column" alignItems="stretch" justifyContent="flex-start" className={styles.content}>
                    <Phases />
                    <main className={styles.main}>{children}</main>
                </Flex>
            </Flex>
        </UserProvider>
    );
}
