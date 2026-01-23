import type { AnyContent, Content } from '@frontend/components/content/content.types';
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
        text: string;
    } | null;
};

// Generic type for story elements and tale element
type GenericStoryElement = {
    imageId: number | null;
    imageUrl: string | null;
};

// --- structure of each story ---
export type StoryElement = GenericStoryElement & {
    description: string | null;
    inspiredStoryId?: number | null;
};

// --- structure of each tale ---
type TaleElement = {
    imageId: number | null;
    imageStory: string | null;
    tale: string | null;
};

type HintActivity = {
    type: 'indice';
    data: {
        content: Content;
        customHint: Content;
        defaultHint: string;
    } | null;
};

type StoryActivity = {
    type: 'histoire';
    data: {
        odd: StoryElement;
        object: StoryElement;
        place: StoryElement;
        tale: TaleElement;
        isOriginal: boolean;
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

export type Activities = FreeActivity | GameActivity | PuzzleActivity | HintActivity | ReportActivity | StoryActivity;
export type ActivityType = Activities['type'];
export type ActivityData<T extends ActivityType> = Extract<Activities, { type: T }>['data'];

// Use a map to catch missing values and ensure uniqueness
// Order is important, it is used to display the activities in the correct order in the UI
const ACTIVITY_TYPES_MAP: Record<ActivityType, boolean> = {
    libre: true,
    jeu: true,
    enigme: true,
    indice: true,
    reportage: true,
    histoire: true,
};
export const ACTIVITY_TYPES_ENUM = Object.keys(ACTIVITY_TYPES_MAP) as ActivityType[];

export const phaseActivityTypes = pgTable('phase_activity_types', {
    phase: smallint('phase').primaryKey(),
    activityTypes: jsonb('activity_types').$type<ActivityType[]>().notNull(),
});

export type PhaseActivityType = typeof phaseActivityTypes.$inferSelect;
