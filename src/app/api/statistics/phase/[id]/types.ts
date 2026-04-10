import type { ActivityType } from '@server/database/schemas/activity-types';

export interface PhaseActivitiesQueryResult {
    count: number;
    type: string | null;
    name: string;
    id: number | string;
}

export type PhaseTableColumn = ActivityType | 'draft' | 'video';

export type PhaseActivitiesRow = {
    id: number | string;
    name: string;
    activities: Partial<Record<PhaseTableColumn, number>>;
};

export interface PhaseActivitiesResponse {
    rows: PhaseActivitiesRow[];
    totals?: Partial<Record<PhaseTableColumn, number>>;
    totalElements: number;
}
