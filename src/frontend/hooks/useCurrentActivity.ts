'use client';

import type { Activity, ActivityType } from '@server/database/schemas/activities';

import { useLocalStorage } from './useLocalStorage';

interface useCurrentActivityArgs {
    activityType: ActivityType;
}

export const useCurrentActivity = ({
    activityType,
}: useCurrentActivityArgs): {
    activity: Partial<Activity>;
    setActivity: (activity: Partial<Activity>) => void;
} => {
    const [localActivity, setLocalActivity] = useLocalStorage<Partial<Activity> | undefined>('activity', undefined);

    return {
        activity:
            localActivity?.type === activityType
                ? localActivity
                : {
                      type: activityType,
                  },
        setActivity: setLocalActivity,
    };
};
