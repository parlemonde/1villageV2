import type { ClassroomVillageTeacher } from '@app/api/classrooms/route';
import type { Classroom } from '@server/database/schemas/classrooms';

export function getClassroomFromMap(map: Partial<Record<number, Classroom | ClassroomVillageTeacher>>, id: number | null) {
    if (id === null) return undefined;
    const entry = map[id];
    if (entry && 'classroom' in entry) return entry.classroom;
    return undefined;
}
