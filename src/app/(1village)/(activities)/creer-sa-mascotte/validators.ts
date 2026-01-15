import type { MascotActivity } from '@server/database/schemas/activity-types';

export const MASCOT_STEPS_VALIDATORS = {
    isStep1Valid: (activity: Partial<MascotActivity>) => {
        return (
            activity.data?.classroom?.students?.malesCount !== undefined &&
            activity.data?.classroom?.students?.femalesCount !== undefined &&
            activity.data?.classroom?.students?.totalCount &&
            activity.data.classroom.students.meanAge &&
            activity.data?.classroom?.teachers?.malesCount !== undefined &&
            activity.data?.classroom?.teachers?.femalesCount !== undefined &&
            activity.data?.classroom?.teachers?.totalCount &&
            activity.data?.classroom?.school?.classroomsCount &&
            activity.data?.classroom?.school?.studentsCount &&
            !!activity.data?.classroom?.imageUrl?.trim() &&
            !!activity.data?.classroom?.description?.trim() &&
            activity.data.classroom.students.totalCount ==
                activity.data.classroom.students.malesCount + activity.data.classroom.students.femalesCount &&
            activity.data.classroom.teachers.totalCount == activity.data.classroom.teachers.malesCount + activity.data.classroom.teachers.femalesCount
        );
    },

    isStep2Valid: (activity: Partial<MascotActivity>) => {
        return (
            !!activity?.data?.mascot?.name?.trim() &&
            !!activity.data.mascot?.description?.trim() &&
            activity.data.mascot.personalityTraits?.length === 3 &&
            (activity.data.mascot.favoriteCountries?.length ?? 0) > 0 &&
            !!activity.data.mascot.favoriteGame?.trim() &&
            !!activity.data.mascot.favoriteSport?.trim()
        );
    },

    isStep3Valid: (activity: Partial<MascotActivity>) => {
        return (
            (activity.data?.languages?.spokenByAll || []).length > 0 &&
            (activity.data?.languages?.spokenBySome || []).length > 0 &&
            (activity.data?.languages?.taught || []).length > 0 &&
            (activity.data?.languages?.currencies || []).length > 0
        );
    },

    isStep4Valid: (activity: Partial<MascotActivity>) => {
        return activity?.data?.hasAcceptedRules;
    },
};
