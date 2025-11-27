import { UserProvider } from '@frontend/contexts/userContext';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { redirect } from 'next/navigation';

import { AdminSidebar } from './AdminSidebar';
import { Header } from './Header';
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
            <Header />
            <div className={styles.adminLayout}>
                <div className={styles.adminSidebar}>
                    <div className={styles.adminSidebarStickyContent}>
                        <AdminSidebar />
                    </div>
                </div>
                <main className={styles.adminMainContent}>{children}</main>
            </div>
        </UserProvider>
    );
}
