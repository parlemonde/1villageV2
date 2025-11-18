import { UserProvider } from '@frontend/contexts/userContext';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { redirect } from 'next/navigation';

import styles from './layout.module.css';
import { Header } from './Header';
import { AdminSidebar } from './AdminSidebar';

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
            <div className={styles.backgroundWrapper}>
                <div className={styles.rootLayout}>
                    <Header />
                    <AdminSidebar />
                    <main className={styles.content}>{children}</main>
                </div>
            </div>
        </UserProvider>
    );
}
