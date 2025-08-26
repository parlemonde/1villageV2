import { redirect } from 'next/navigation';

import { Header } from './Header';
import { Navigation } from './Navigation';
import { Phases } from './Phases';
import styles from './layout.module.css';
import { UserProvider } from '@/contexts/userContext';
import { VillageProvider } from '@/contexts/villageContext';
import { getCurrentVillageAndClassroomForUser } from '@/server-functions/get-current-village-and-classroom';
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
    const { village, classroom } = await getCurrentVillageAndClassroomForUser(user);
    return (
        <UserProvider initialUser={user} classroom={classroom}>
            <VillageProvider village={village}>
                <Header />
                <div className={styles.rootLayout}>
                    {village && <Navigation village={village} classroomCountryCode={classroom?.countryCode} />}
                    <div className={styles.content}>
                        {village && <Phases />}
                        <main className={styles.main}>{children}</main>
                    </div>
                </div>
            </VillageProvider>
        </UserProvider>
    );
}
