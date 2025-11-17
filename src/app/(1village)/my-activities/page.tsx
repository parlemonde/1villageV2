import { Title } from '@frontend/components/ui/Title';
import { db } from '@server/database';
import type { Activity } from '@server/database/schemas/activities';
import { activities } from '@server/database/schemas/activities';
import { getTeacherClassroom } from '@server/entities/classrooms/get-teacher-classroom';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { and, eq, isNull, desc } from 'drizzle-orm';

import { MyActivities } from './my-activities';
import { PageContainer } from '@frontend/components/ui/PageContainer/PageContainer';

export default async function MyClassroom() {
    const user = await getCurrentUser();

    if (!user) {
        // Login redirection is handled by the parent layout
        return null;
    }
    const allActivities = (await db
        .select()
        .from(activities)
        .where(and(eq(activities.userId, user.id), isNull(activities.deleteDate)))
        .orderBy(desc(activities.updateDate))) as Activity[];

    const isPelico = user.role === 'admin' || user.role === 'mediator';
    const classroom = isPelico ? undefined : await getTeacherClassroom(user.id);

    return (
        <PageContainer title={isPelico ? 'Activités de Pélico' : 'Mes activités'}>
            <MyActivities activities={allActivities} user={user} classroom={classroom} />
        </PageContainer>
    );
}
