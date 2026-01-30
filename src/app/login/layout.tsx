import { Link } from '@frontend/components/ui/Link';
import LogoSVG from '@frontend/svg/logo.svg';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { redirect } from 'next/navigation';

import { BackButton } from './BackButton';
import styles from './layout.module.css';

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
                    <Link href="/" className={styles.logoContainer}>
                        <LogoSVG className={styles.logo} />
                        <span className={styles.title}>1Village</span>
                    </Link>
                    <BackButton />
                </div>
                <div className={styles.loginContent}>{children}</div>
            </div>
        </main>
    );
}
