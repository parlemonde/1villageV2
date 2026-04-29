import { cookies } from 'next/headers';

export const getSelectedClassroom = async (): Promise<number | undefined> => {
    const cookieStore = await cookies();
    const selectedClassroomIdStr = cookieStore.get('classroomId')?.value;
    const selectedClassroomId = selectedClassroomIdStr ? Number(selectedClassroomIdStr) : undefined;
    return selectedClassroomId;
};
