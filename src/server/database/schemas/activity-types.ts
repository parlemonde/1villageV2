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
        text: string;
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

export type CulinaryChallenge = {
    theme: 'culinaire';
    dish?: {
        imageUrl?: string;
        name?: string;
        history?: string;
        description?: string;
    };
    content?: AnyContent[];
    challengeKind?: string;
};

export type LinguisticChallenge = {
    theme: 'linguistique';
    language?: string;
    languageKnowledge?: string;
    textKind?: 'word' | 'idiom' | 'poem' | 'song' | string;
    content?: AnyContent[];
    challengeKind?: string;
};

export type EcologicalChallenge = {
    theme: 'ecologique';
    action?: string;
    content?: AnyContent[];
    challengeKind?: string;
};

export type FreeThemeChallenge = {
    theme: 'libre';
    themeName?: string;
    action?: string;
    content?: AnyContent[];
    challengeKind?: string;
};

type Challenge = CulinaryChallenge | LinguisticChallenge | EcologicalChallenge | FreeThemeChallenge;
export type ChallengeActivity<T = Challenge> = {
    type: 'defi';
    data: T;
};
export type ChallengeType = Challenge['theme'];

export type Activities = FreeActivity | GameActivity | PuzzleActivity | HintActivity | ChallengeActivity;
export type ActivityType = Activities['type'];
// Use a map to catch missing values and ensure uniqueness
// Order is important, it is used to display the activities in the correct order in the UI
const ACTIVITY_TYPES_MAP: Record<ActivityType, boolean> = {
    libre: true,
    defi: true,
    jeu: true,
    enigme: true,
    indice: true,
};
export const ACTIVITY_TYPES_ENUM = Object.keys(ACTIVITY_TYPES_MAP) as ActivityType[];

export const phaseActivityTypes = pgTable('phase_activity_types', {
    phase: smallint('phase').primaryKey(),
    activityTypes: jsonb('activity_types').$type<ActivityType[]>().notNull(),
});

export type PhaseActivityType = typeof phaseActivityTypes.$inferSelect;
