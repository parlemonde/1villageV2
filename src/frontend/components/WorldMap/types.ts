import type { Classroom } from '@server/database/schemas/classrooms';

export interface WorldMapUser {
    id: number;
    position: {
        lat: number;
        lng: number;
    };
    classroom: Classroom;
}

export enum UserType {
    TEACHER = 3,
}
