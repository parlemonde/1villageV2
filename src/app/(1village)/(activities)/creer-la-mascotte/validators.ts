import type { MascotActivity } from '@server/database/schemas/activity-types';

export const MASCOT_STEPS_VALIDATORS = {
    isStep1Valid: (activity: Partial<MascotActivity>) => {
        return (
            activity.data?.classroom?.students?.malesCount !== undefined &&
            activity.data?.classroom?.students?.femalesCount !== undefined &&
            activity.data?.classroom?.students?.totalCount !== undefined &&
            activity.data.classroom.students.meanAge !== undefined &&
            activity.data?.classroom?.teachers?.malesCount !== undefined &&
            activity.data?.classroom?.teachers?.femalesCount !== undefined &&
            activity.data?.classroom?.teachers?.totalCount !== undefined &&
            activity.data?.classroom?.school?.classroomsCount !== undefined &&
            activity.data?.classroom?.school?.studentsCount !== undefined &&
            !!activity.data?.mascot?.imageUrl?.trim() &&
            !!activity.data?.mascot?.description?.trim()
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
            activity.data?.languages?.spokenByAll !== undefined &&
            activity.data?.languages?.spokenBySome !== undefined &&
            activity.data?.languages?.taught !== undefined &&
            activity.data?.languages?.currencies !== undefined
        );
    },
};
