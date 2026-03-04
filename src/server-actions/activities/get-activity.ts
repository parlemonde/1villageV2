import { db } from '@server/database';
import { activities, type Activity } from '@server/database/schemas/activities';
import { activityVisibility } from '@server/database/schemas/activity-visibility';
import { classrooms } from '@server/database/schemas/classrooms';
import { parentsStudents } from '@server/database/schemas/parents-students';
import { students } from '@server/database/schemas/students';
import { villages } from '@server/database/schemas/villages';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { getCurrentVillageAndClassroomForUser } from '@server/helpers/get-current-village-and-classroom';
import { and, eq, isNotNull } from 'drizzle-orm';

export const getActivity = async (id: number | null): Promise<Activity | undefined> => {
    if (!id) {
        return undefined;
    }

    const user = await getCurrentUser();
    if (!user) {
        return undefined;
    }
    const { village } = await getCurrentVillageAndClassroomForUser(user);
    if (!village) {
        return undefined;
    }

    if (user.role == 'parent') {
        const [row] = await db
            .select({ activities })
            .from(parentsStudents)
            .innerJoin(students, eq(students.id, parentsStudents.studentId))
            .innerJoin(classrooms, eq(classrooms.id, students.classroomId))
            .innerJoin(villages, eq(villages.id, classrooms.villageId))
            .innerJoin(activities, eq(activities.villageId, villages.id))
            .innerJoin(activityVisibility, eq(activities.id, activityVisibility.activityId))
            .where(
                and(
                    eq(activities.id, id),
                    eq(activityVisibility.isHidden, false),
                    eq(activities.villageId, village.id),
                    isNotNull(activities.publishDate),
                ),
            )
            .limit(1);

        return row?.activities as Activity | undefined;
    }

    return (await db.query.activities.findFirst({
        where: and(eq(activities.id, id), eq(activities.userId, user.id), isNotNull(activities.publishDate)),
    })) as Activity | undefined;
};
