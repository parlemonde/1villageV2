import { Title } from '@frontend/components/ui/Title';
import { db } from '@server/database';
import type { Activity } from '@server/database/schemas/activities';
import { activities } from '@server/database/schemas/activities';
import { getTeacherClassroom } from '@server/entities/classrooms/get-teacher-classroom';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { getCurrentVillageAndClassroomForUser } from '@server/helpers/get-current-village-and-classroom';
import { and, eq, isNull, desc } from 'drizzle-orm';

import { MyActivities } from './my-activities';

export default async function MyClassroom() {
    const user = await getCurrentUser();
    const { village } = user ? await getCurrentVillageAndClassroomForUser(user) : { village: undefined };

    if (!user || !village) {
        // Login redirection is handled by the parent layout
        return null;
    }

    const allActivities = (await db
        .select()
        .from(activities)
        .where(and(eq(activities.userId, user.id), isNull(activities.deleteDate), eq(activities.villageId, village.id)))
        .orderBy(desc(activities.updateDate))) as Activity[];

    const isPelico = user.role === 'admin' || user.role === 'mediator';
    const classroom = isPelico ? undefined : await getTeacherClassroom(user.id);

    return (
        <div style={{ padding: '16px 16px 32px 16px' }}>
            <Title>{isPelico ? 'Activités de Pélico' : 'Mes activités'}</Title>
            <MyActivities activities={allActivities} user={user} classroom={classroom} />
        </div>
    );
}
