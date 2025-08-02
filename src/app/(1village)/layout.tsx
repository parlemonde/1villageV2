import { redirect } from 'next/navigation';

import { Header } from './Header';
import { Navigation } from './Navigation';
import { Phases } from './Phases';
import styles from './layout.module.css';
import { Flex } from '@/components/layout/Flex';
import { UserProvider } from '@/contexts/userContext';
import { VillageProvider } from '@/contexts/villageContext';
import { getUserClassroomAndVillage } from '@/server-functions/get-user-classroom-and-village';
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
    const { classroom, village } = await getUserClassroomAndVillage(user.id);
    return (
        <UserProvider initialUser={user} classroom={classroom}>
            <VillageProvider village={village}>
                <Header />
                <Flex justifyContent="flex-start" alignItems="stretch" className={styles.rootLayout}>
                    {village && <Navigation village={village} classroomCountryCode={classroom?.countryCode} />}
                    <Flex isFullWidth flexDirection="column" alignItems="stretch" justifyContent="flex-start" className={styles.content}>
                        {village && <Phases />}
                        <main className={styles.main}>{children}</main>
                    </Flex>
                </Flex>
            </VillageProvider>
        </UserProvider>
    );
}
