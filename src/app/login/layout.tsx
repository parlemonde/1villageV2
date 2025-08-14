import { redirect } from 'next/navigation';

import { BackButton } from './BackButton';
import styles from './layout.module.css';
import { Flex } from '@/components/ui/Flex';
import { getCurrentUser } from '@/server-functions/getCurrentUser';
import LogoSVG from '@/svg/logo.svg';

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const user = await getCurrentUser();
    if (user) {
        redirect(user.role === 'admin' ? '/admin' : '/');
    }
    return (
        <main className={styles.loginLayout}>
            <div className={styles.loginContainer}>
                <div className={styles.loginHeader}>
                    <Flex alignItems="center">
                        <LogoSVG className={styles.logo} />
                        <span className={styles.title}>1Village</span>
                    </Flex>
                    <BackButton />
                </div>
                <div className={styles.loginContent}>{children}</div>
            </div>
        </main>
    );
}
