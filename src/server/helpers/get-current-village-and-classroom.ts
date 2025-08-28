import type { Classroom } from '@server/database/schemas/classrooms';
import type { User } from '@server/database/schemas/users';
import type { Village } from '@server/database/schemas/villages';
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
    async (user: User): Promise<{ village: Village | undefined; classroom: Classroom | undefined }> => {
        switch (user.role) {
            case 'teacher': {
                const classroom = await getTeacherClassroom(user.id);
                if (classroom) {
                    return {
                        village: await getVillage(classroom.villageId),
                        classroom,
                    };
                }
                break;
            }
            case 'mediator':
            case 'admin': {
                const cookieStore = await cookies();
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
