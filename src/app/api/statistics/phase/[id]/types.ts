import type { ActivityType } from '@server/database/schemas/activity-types';

export interface PhaseActivitiesQueryResult {
    count: number;
    type: string;
    name: string;
}

export type PhaseActivitiesRow = {
    name: string;
    activities: Partial<Record<ActivityType, number>>;
};

export interface PhaseActivitiesResponse {
    rows: PhaseActivitiesRow[];
    totals?: Partial<Record<ActivityType, number>>;
    totalElements: number;
}
