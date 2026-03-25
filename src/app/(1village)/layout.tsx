import { UserProvider } from '@frontend/contexts/userContext';
import { VillageProvider } from '@frontend/contexts/villageContext';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { getCurrentVillageAndClassroomForUser } from '@server/helpers/get-current-village-and-classroom';
import { getSelectedClassroom } from '@server-actions/classrooms/get-selected-classroom';
import { redirect } from 'next/navigation';

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
    const user = await getCurrentUser();
    if (!user) {
        redirect('/login');
    }

    const selectedClassroomIdStr = await getSelectedClassroom();
    const selectedClassroomId = selectedClassroomIdStr ? Number(selectedClassroomIdStr) : undefined;
    const { village, classroom } = await getCurrentVillageAndClassroomForUser(user, selectedClassroomId);
    return (
        <UserProvider initialUser={user} initialClassroom={classroom}>
            <VillageProvider initialVillage={village}>
                <Header />
                <div className={styles.rootLayout}>
                    {village && <Navigation />}
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
