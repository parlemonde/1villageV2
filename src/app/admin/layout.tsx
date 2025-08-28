import { Button } from '@frontend/components/ui/Button';
import { UserProvider } from '@frontend/contexts/userContext';
import LogoSVG from '@frontend/svg/logo.svg';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { redirect } from 'next/navigation';

import { AdminNavigation } from './Navigation';
import styles from './layout.module.css';

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
                    <LogoSVG className={styles.logo} />
                    <span className={styles.title}>1Village - Admin</span>
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
