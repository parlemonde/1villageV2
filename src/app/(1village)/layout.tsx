import { UserProvider } from '@frontend/contexts/userContext';
import { VillageProvider } from '@frontend/contexts/villageContext';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { getCurrentVillageAndClassroomForUser } from '@server/helpers/get-current-village-and-classroom';
import { redirect } from 'next/navigation';

import { Header } from './Header';
import { Navigation } from './Navigation';
import { Phases } from './Phases';
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
