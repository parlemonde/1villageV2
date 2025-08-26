import { cookies } from 'next/headers';
import { cache } from 'react';

import { getTeacherClassroom } from './classrooms/getTeacherClassroom';
import { getVillage } from './villages/getVillage';
import type { Classroom } from '@/database/schemas/classrooms';
import type { User } from '@/database/schemas/users';
import type { Village } from '@/database/schemas/villages';

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
