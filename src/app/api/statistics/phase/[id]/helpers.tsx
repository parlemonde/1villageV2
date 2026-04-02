import type { ActivityType } from '@server/database/schemas/activity-types';

import type { PhaseActivitiesQueryResult, PhaseActivitiesResponse } from './types';

export const aggregateActivities = (
    activities: PhaseActivitiesQueryResult[],
): { rows: PhaseActivitiesResponse['rows']; totals?: PhaseActivitiesResponse['totals'] } => {
    const totals: Partial<Record<ActivityType, number>> = {};
    const map = new Map<string, Partial<Record<ActivityType, number>>>();

    activities.forEach((activity) => {
        if (!map.has(activity.name)) {
            map.set(activity.name, {});
        }

        const activitiesByEntity = map.get(activity.name)!;
        activitiesByEntity[activity.type as ActivityType] = activity.count;
        totals[activity.type as ActivityType] = (totals[activity.type as ActivityType] || 0) + activity.count;
    });

    const rows = Array.from(map, ([name, activities]) => ({ name, activities }));
    return { rows, totals };
};
