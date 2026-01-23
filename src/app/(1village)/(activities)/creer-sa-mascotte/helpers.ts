import type { MascotActivity } from '@server/database/schemas/activity-types';

type MascotData = NonNullable<MascotActivity['data']['mascot']>;
type ClassroomData = NonNullable<MascotActivity['data']['classroom']>;
type StudentsData = NonNullable<ClassroomData['students']>;
type TeachersData = NonNullable<ClassroomData['teachers']>;
type SchoolData = NonNullable<ClassroomData['school']>;
type LanguagesData = NonNullable<MascotActivity['data']['languages']>;

export const mascotActivityHelpers = (activity: Partial<MascotActivity>, setActivity: (activity: Partial<MascotActivity>) => void) => {
    const setMascot = <K extends keyof MascotData>(field: K, value: MascotData[K]) => {
        setActivity({
            ...activity,
            data: {
                ...activity.data,
                mascot: {
                    ...(activity.data?.mascot || {}),
                    [field]: value,
                },
            },
        });
    };

    const setClassroomStudents = <K extends keyof StudentsData>(field: K, value: StudentsData[K]) => {
        setActivity({
            ...activity,
            data: {
                ...activity.data,
                classroom: {
                    ...(activity.data?.classroom || {}),
                    students: {
                        ...(activity.data?.classroom?.students || {}),
                        [field]: value,
                    },
                },
            },
        });
    };

    const setTeachers = <K extends keyof TeachersData>(field: K, value: TeachersData[K]) => {
        setActivity({
            ...activity,
            data: {
                ...activity.data,
                classroom: {
                    ...(activity.data?.classroom || {}),
                    teachers: {
                        ...(activity.data?.classroom?.teachers || {}),
                        [field]: value,
                    },
                },
            },
        });
    };

    const setSchool = <K extends keyof SchoolData>(field: K, value: SchoolData[K]) => {
        setActivity({
            ...activity,
            data: {
                ...activity.data,
                classroom: {
                    ...(activity.data?.classroom || {}),
                    school: {
                        ...(activity.data?.classroom?.school || {}),
                        [field]: value,
                    },
                },
            },
        });
    };

    const setClassroom = (field: 'alias' | 'imageUrl' | 'description', value: string) => {
        setActivity({
            ...activity,
            data: {
                ...activity.data,
                classroom: {
                    ...(activity.data?.classroom || {}),
                    [field]: value,
                },
            },
        });
    };

    const setLanguages = <K extends keyof LanguagesData>(field: K, value: LanguagesData[K]) => {
        setActivity({
            ...activity,
            data: {
                ...activity.data,
                languages: {
                    ...(activity.data?.languages || {}),
                    [field]: value,
                },
            },
        });
    };

    const setHasAcceptedRules = (value: boolean) => {
        setActivity({
            ...activity,
            data: {
                ...activity.data,
                hasAcceptedRules: value,
            },
        });
    };

    return {
        setMascot,
        setClassroomStudents,
        setTeachers,
        setSchool,
        setClassroom,
        setLanguages,
        setHasAcceptedRules,
    };
};
