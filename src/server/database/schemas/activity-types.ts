import type { ThemeName } from '@app/(1village)/(activities)/creer-une-enigme/enigme-constants';
import type { AnyContent } from '@frontend/components/content/content.types';
import { pgTable, smallint, jsonb } from 'drizzle-orm/pg-core';

type FreeActivity = {
    type: 'libre';
    data: {
        title?: string;
        resume?: string;
        cardImageUrl?: string;
        content?: AnyContent[];
    } | null;
};

type GameActivity = {
    type: 'jeu';
    data: {
        gameId: string;
    } | null;
};

type PuzzleActivity = {
    type: 'enigme';
    data: {
        defaultTheme?: ThemeName;
        customTheme?: string;
        content?: AnyContent[];
        answer?: string | AnyContent[];
    } | null;
};

type HintActivity = {
    type: 'indice';
    data: {
        defaultHint?: string;
        customHint?: string;
        content?: AnyContent[];
    } | null;
};

type ReportActivity = {
    type: 'reportage';
    data: {
        defaultReport?: string;
        customReport?: string;
        content?: AnyContent[];
    } | null;
};

export type Activities = FreeActivity | GameActivity | PuzzleActivity | HintActivity | ReportActivity;
export type ActivityType = Activities['type'];
// Use a map to catch missing values and ensure uniqueness
// Order is important, it is used to display the activities in the correct order in the UI
const ACTIVITY_TYPES_MAP: Record<ActivityType, boolean> = {
    libre: true,
    jeu: true,
    enigme: true,
    indice: true,
    reportage: true,
};
export const ACTIVITY_TYPES_ENUM = Object.keys(ACTIVITY_TYPES_MAP) as ActivityType[];

export const phaseActivityTypes = pgTable('phase_activity_types', {
    phase: smallint('phase').primaryKey(),
    activityTypes: jsonb('activity_types').$type<ActivityType[]>().notNull(),
});

export type PhaseActivityType = typeof phaseActivityTypes.$inferSelect;
