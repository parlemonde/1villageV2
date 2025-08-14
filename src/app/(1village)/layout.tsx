import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { Header } from './Header';
import { Navigation } from './Navigation';
import { Phases } from './Phases';
import styles from './layout.module.css';
import { UserProvider } from '@/contexts/userContext';
import { VillageProvider } from '@/contexts/villageContext';
import { getTeacherClassroom } from '@/server-functions/classrooms/getTeacherClassroom';
import { getCurrentUser } from '@/server-functions/getCurrentUser';
import { getVillage } from '@/server-functions/villages/getVillage';

const getNumber = (value: string | undefined) => {
    const n = Number(value);
    if (!isNaN(n) && isFinite(n)) {
        return n;
    }
    return undefined;
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const user = await getCurrentUser();
    const cookieStore = await cookies();
    if (!user) {
        redirect('/login');
    }
    const classroom = user.role === 'teacher' ? await getTeacherClassroom(user.id) : undefined;
    const villageId = classroom?.villageId ?? getNumber(cookieStore.get('villageId')?.value);
    const village = villageId ? await getVillage(villageId) : undefined;
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
