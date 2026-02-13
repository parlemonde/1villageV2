import { Header } from '@app/(1village)/Header';
import { UserProvider } from '@frontend/contexts/userContext';
import { VillageProvider } from '@frontend/contexts/villageContext';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { getCurrentVillageAndClassroomForUser } from '@server/helpers/get-current-village-and-classroom';
import { redirect } from 'next/navigation';

import styles from './layout.module.css';

export default async function PelicoLayout({
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
        <UserProvider initialUser={user} initialClassroom={classroom}>
            <VillageProvider village={village}>
                <Header />
                <div className={styles.rootLayout}>
                    <main className={styles.main}>{children}</main>
                </div>
            </VillageProvider>
        </UserProvider>
    );
}
