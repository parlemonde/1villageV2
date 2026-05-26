import type { Classroom } from '@server/database/schemas/classrooms';
import type { User } from '@server/database/schemas/users';
import type { Village } from '@server/database/schemas/villages';
import { getParentClassroom } from '@server/entities/classrooms/get-parent-classroom';
import { getTeacherClassroom } from '@server/entities/classrooms/get-teacher-classroom';
import { getVillage } from '@server/entities/villages/get-village';
import { cookies } from 'next/headers';
import { cache } from 'react';

const getNumber = (value: string | undefined) => {
    const n = Number(value);
    if (Number.isSafeInteger(n)) {
        return n;
    }
    return undefined;
};

export const getCurrentVillageAndClassroomForUser = cache(
    async (user: User, classroomId?: number): Promise<{ village: Village | undefined; classroom: Classroom | undefined }> => {
        const cookieStore = await cookies();

        switch (user.role) {
            case 'teacher': {
                // Use provided classroomId or read from cookie for cache consistency
                const resolvedClassroomId = classroomId ?? getNumber(cookieStore.get('classroomId')?.value);
                const classroom = await getTeacherClassroom(user.id, resolvedClassroomId);
                if (classroom) {
                    return {
                        village: classroom.villageId ? await getVillage(classroom.villageId) : undefined,
                        classroom,
                    };
                }
                break;
            }
            case 'parent': {
                const classroom = await getParentClassroom(user.id);
                if (classroom) {
                    return {
                        village: classroom.villageId ? await getVillage(classroom.villageId) : undefined,
                        classroom,
                    };
                }
                break;
            }
            case 'mediator':
            case 'admin': {
                const villageId = getNumber(cookieStore.get('villageId')?.value);
                if (villageId) {
                    return {
                        village: await getVillage(villageId),
                        classroom: undefined,
                    };
                }
                break;
            }
        }

        return {
            village: undefined,
            classroom: undefined,
        };
    },
);
