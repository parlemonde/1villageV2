import type { AnyContent } from '@frontend/components/content/content.types';
import { pgTable, smallint, jsonb } from 'drizzle-orm/pg-core';

export type FreeActivity = {
    type: 'libre';
    data: {
        title?: string;
        resume?: string;
        cardImageUrl?: string;
        content?: AnyContent[];
    } | null;
};

export type GameActivity = {
    type: 'jeu';
    data: {
        gameId: string;
    } | null;
};

export type PuzzleActivity = {
    type: 'enigme';
    data: {
        text: string;
    } | null;
};

export type Activities = FreeActivity | GameActivity | PuzzleActivity;
export type ActivityType = Activities['type'];
// Use a map to catch missing values and ensure uniqueness
// Order is important, it is used to display the activities in the correct order in the UI
const ACTIVITY_TYPES_MAP: Record<ActivityType, boolean> = {
    libre: true,
    jeu: true,
    enigme: true,
};
export const ACTIVITY_TYPES_ENUM = Object.keys(ACTIVITY_TYPES_MAP) as ActivityType[];

export const phaseActivityTypes = pgTable('phase_activity_types', {
    phase: smallint('phase').primaryKey(),
    activityTypes: jsonb('activity_types').$type<ActivityType[]>().notNull(),
});

export type PhaseActivityType = typeof phaseActivityTypes.$inferSelect;
