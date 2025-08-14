import { redirect } from 'next/navigation';

import { AdminNavigation } from './Navigation';
import styles from './layout.module.css';
import { Button } from '@/components/ui/Button';
import { Flex } from '@/components/ui/Flex';
import { UserProvider } from '@/contexts/userContext';
import { getCurrentUser } from '@/server-functions/getCurrentUser';
import LogoSVG from '@/svg/logo.svg';

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const user = await getCurrentUser();
    if (!user) {
        redirect('/login');
    }
    if (user.role !== 'admin') {
        redirect('/');
    }
    return (
        <UserProvider initialUser={user}>
            <div className={styles.adminLayout}>
                <header className={styles.adminHeader}>
                    <Flex alignItems="center">
                        <LogoSVG className={styles.logo} />
                        <span className={styles.title}>1Village - Admin</span>
                    </Flex>
                    <Button as="a" href="/" isUpperCase={false} label="Aller au village" variant="outlined" size="sm" color="primary" />
                </header>
                <div className={styles.adminSidebar}>
                    <div className={styles.adminSidebarContent}>
                        <AdminNavigation />
                    </div>
                </div>
                <main className={styles.adminMainContent}>{children}</main>
            </div>
        </UserProvider>
    );
}
