import type { Classroom } from '@server/database/schemas/classrooms';
import type { User } from '@server/database/schemas/users';
import type { Village } from '@server/database/schemas/villages';
import { getClassroomForParentId } from '@server/entities/classrooms/get-student-classroom';
import { getTeacherClassrooms } from '@server/entities/classrooms/get-teacher-classrooms';
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
    async (user: User): Promise<{ village: Village | undefined; classroom: Classroom | undefined; classrooms: Classroom[] }> => {
        const cookieStore = await cookies();

        switch (user.role) {
            case 'teacher': {
                const teacherClassrooms = await getTeacherClassrooms(user.id);
                const cookieClassroomId = getNumber(cookieStore.get('classroomId')?.value);
                const classroom = cookieClassroomId
                    ? (teacherClassrooms.find((c) => c.id === cookieClassroomId) ?? teacherClassrooms[0])
                    : teacherClassrooms[0];
                if (classroom) {
                    return {
                        village: classroom.villageId ? await getVillage(classroom.villageId) : undefined,
                        classroom,
                        classrooms: teacherClassrooms,
                    };
                }
                break;
            }
            case 'parent': {
                const classroom = await getClassroomForParentId(user.id);
                if (classroom) {
                    return {
                        village: classroom.villageId ? await getVillage(classroom.villageId) : undefined,
                        classroom,
                        classrooms: [],
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
                        classrooms: [],
                    };
                }
                break;
            }
        }

        return {
            village: undefined,
            classroom: undefined,
            classrooms: [],
        };
    },
);
