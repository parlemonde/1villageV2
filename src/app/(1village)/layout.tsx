import { UserProvider } from '@frontend/contexts/userContext';
import { VillageProvider } from '@frontend/contexts/villageContext';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { getCurrentVillageAndClassroomForUser } from '@server/helpers/get-current-village-and-classroom';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { ActivitySidePanel } from './ActivitySidePanel';
import { Header } from './Header';
import { Navigation } from './Navigation';
import { Phases } from './Phases';
import styles from './layout.module.css';

export default async function VillageLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const t = await getTranslations();
    const user = await getCurrentUser();
    if (!user) {
        redirect('/login');
    }
    const { village, classroom } = await getCurrentVillageAndClassroomForUser(user);
    return (
        <UserProvider initialUser={user} initialClassroom={classroom}>
            <VillageProvider village={village}>
                <Header />
                <div className={styles.rootLayout}>
                    <h1>
                        {t('HomePage.title', {
                            firstName: 'John',
                        })}
                    </h1>
                    {village && <Navigation village={village} classroomCountryCode={classroom?.countryCode} />}
                    <div className={styles.content}>
                        {village && <Phases />}
                        <main className={styles.main}>{children}</main>
                    </div>
                    <ActivitySidePanel />
                </div>
            </VillageProvider>
        </UserProvider>
    );
}
