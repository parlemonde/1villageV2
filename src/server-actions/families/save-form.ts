'use server';

import type { FamilyForm } from '@frontend/contexts/familyContext';
import { db } from '@server/database';
import { activityVisibility } from '@server/database/schemas/activity-visibility';
import type { Classroom } from '@server/database/schemas/classrooms';
import { classrooms } from '@server/database/schemas/classrooms';
import { students } from '@server/database/schemas/students';
import type { User } from '@server/database/schemas/users';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { getCurrentVillageAndClassroomForUser } from '@server/helpers/get-current-village-and-classroom';
import type { SQL } from 'drizzle-orm';
import { and, eq, inArray, sql } from 'drizzle-orm';

const updateClassroomActivitiesVisibility = async (classroomId: number, showOnlyClassroomActivities: boolean) => {
    await db.update(classrooms).set({ showOnlyClassroomActivities }).where(eq(classrooms.id, classroomId));
};

const updateActivityVisibility = async (hiddenActivities: number[], user: User, classroom: Classroom) => {
    await db.update(activityVisibility).set({
        activityId: hiddenActivities[0],
        teacherId: user.id,
        classroomId: classroom.id,
        isHidden: true,
    });
};

const removeStudents = async (
    studentsList: { id?: number; tempId: string; isDeleted?: boolean; firstName: string; lastName: string }[],
    user: User,
    classroom: Classroom,
) => {
    const studentsToDelete = studentsList?.filter((student) => student.id && student.isDeleted) ?? [];
    const studentIdsToDelete = studentsToDelete.map((student) => student.id!);
    await db
        .delete(students)
        .where(and(eq(students.teacherId, user.id), eq(students.classroomId, classroom.id), inArray(students.id, studentIdsToDelete)));
};

const updateStudents = async (studentsList: { id?: number; tempId: string; isDeleted?: boolean; firstName: string; lastName: string }[]) => {
    const studentsToUpdate = studentsList?.filter((student) => student.id) ?? [];

    const sqlChunks: SQL[] = [];
    const ids: number[] = [];

    sqlChunks.push(sql`(case`);
    for (const student of studentsToUpdate) {
        const name = `${student.firstName} ${student.lastName}`;
        sqlChunks.push(sql`when ${students.id} = ${student.id} then ${name}`);
        ids.push(student.id!);
    }

    sqlChunks.push(sql`end)`);

    const finalSql: SQL = sql.join(sqlChunks, sql.raw(' '));
    await db.update(students).set({ name: finalSql }).where(inArray(students.id, ids));
};

const createStudent = async (
    studentsList: { id?: number; tempId: string; isDeleted?: boolean; firstName: string; lastName: string }[],
    user: User,
    classroom: Classroom,
) => {
    const studentsToCreate = studentsList?.filter((student) => !student.id) || [];

    await db.insert(students).values(
        studentsToCreate.map((student) => ({
            name: `${student.firstName} ${student.lastName}`.trim(),
            classroomId: classroom.id,
            teacherId: user.id,
        })),
    );
};

export const saveForm = async ({ showOnlyClassroomActivities, students: studentsList, hiddenActivities }: Partial<FamilyForm>) => {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('Unauthorized');
    }

    const { classroom } = await getCurrentVillageAndClassroomForUser(user);
    if (!classroom) {
        throw new Error("Teacher doesn't have a classroom");
    }

    if (showOnlyClassroomActivities) {
        await updateClassroomActivitiesVisibility(classroom.id, showOnlyClassroomActivities);
    }

    if (hiddenActivities) {
        await updateActivityVisibility(hiddenActivities, user, classroom);
    }

    if (studentsList) {
        await removeStudents(studentsList, user, classroom);
        await updateStudents(studentsList);
        await createStudent(studentsList, user, classroom);
    }
};
