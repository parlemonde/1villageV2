import { COUNTRIES } from '@lib/iso-3166-countries-french';
import type { ActivityType } from '@server/database/schemas/activity-types';

import type { PhaseActivitiesQueryResult, PhaseActivitiesResponse, PhaseTableColumn } from './types';

export const aggregateActivities = (
    activities: PhaseActivitiesQueryResult[],
    draftsCount: { id: number | string; count: number }[],
    videosCount: { id: number | string; count: number }[],
    totalsQueryResult: { type: string; count: number; draftCount: number; videoCount: number }[] = [],
    villageCountries: string[] = [],
): { rows: PhaseActivitiesResponse['rows']; totals?: PhaseActivitiesResponse['totals'] } => {
    const totals: Partial<Record<PhaseTableColumn, number>> = {};
    const map = new Map<string | number, { name: string; activities: Partial<Record<PhaseTableColumn, number>> }>();

    const draftsMap = new Map<number | string, number>();
    draftsCount.forEach((draft) => draftsMap.set(draft.id, draft.count));

    const videosMap = new Map<number | string, number>();
    videosCount.forEach((video) => videosMap.set(video.id, video.count));

    villageCountries.forEach((country) => map.set(country, { name: COUNTRIES[country] ?? country, activities: {} }));

    activities.forEach((activity) => {
        if (!map.has(activity.id)) {
            map.set(activity.id, { name: activity.name, activities: {} });
        }

        const activitiesByEntity = map.get(activity.id)!;
        activitiesByEntity.activities[activity.type as ActivityType] = activity.count;
        activitiesByEntity.activities.draft = draftsMap.get(activity.id);
        activitiesByEntity.activities.video = videosMap.get(activity.id);
    });

    totalsQueryResult.forEach((total) => {
        totals[total.type as PhaseTableColumn] = total.count;
        totals.draft = (totals.draft ?? 0) + total.draftCount;
        totals.video = (totals.video ?? 0) + total.videoCount;
    });

    const rows = Array.from(map, ([id, { name, activities }]) => ({ id, name, activities }));
    return { rows, totals };
};
