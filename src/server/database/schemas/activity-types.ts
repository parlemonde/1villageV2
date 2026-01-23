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

export type IdiomGame = {
    theme: 'expression';
    language?: string;
    languageKnowledge?: string;
    idioms?: {
        stepId?: number;
        imageUrl?: string;
        value?: string;
        meaning?: string;
        falseMeanings?: string[];
    }[];
};

export type CurrencyGame = {
    theme: 'monnaie';
    currency?: string;
    objects?: {
        stepId: number;
        imageUrl?: string;
        name?: string;
        price?: string;
        falsePrices?: string[];
    }[];
};

export type GestureGame = {
    theme: 'mimique';
    gestures?: {
        stepId: number;
        videoUrl?: string;
        meaning?: string;
        origin?: string;
        falseMeanings?: string[];
    }[];
};

type Game = IdiomGame | CurrencyGame | GestureGame;
export type GameType = Game['theme'];

export type GameActivity<T = Game> = {
    type: 'jeu';
    data: T;
};

export type PuzzleActivity = {
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

export type QuestionActivity = {
    type: 'question';
    data: {
        questions?: { id: number; text: string }[];
    };
};

type ReportActivity = {
    type: 'reportage';
    data: {
        defaultReport?: string;
        customReport?: string;
        content?: AnyContent[];
    } | null;
};

export type MascotActivity = {
    type: 'mascotte';
    data: {
        mascot?: {
            name?: string;
            imageUrl?: string;
            description?: string;
            personalityTraits?: string[];
            favoriteCountries?: string[];
            favoriteGame?: string;
            favoriteSport?: string;
        };
        classroom?: {
            students?: {
                totalCount?: number;
                malesCount?: number;
                femalesCount?: number;
                meanAge?: number;
            };
            teachers?: {
                totalCount?: number;
                malesCount?: number;
                femalesCount?: number;
            };
            school?: {
                classroomsCount?: number;
                studentsCount?: number;
            };
            alias?: string;
            imageUrl?: string;
            description?: string;
        };
        languages?: {
            spokenByAll?: string[];
            spokenBySome?: string[];
            taught?: string[];
            currencies?: string[];
        };
        hasAcceptedRules?: boolean;
    };
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

export type Activities = FreeActivity | GameActivity | PuzzleActivity | HintActivity | ReportActivity | MascotActivity | ChallengeActivity | QuestionActivity;
export type ActivityType = Activities['type'];
// Use a map to catch missing values and ensure uniqueness
// Order is important, it is used to display the activities in the correct order in the UI
const ACTIVITY_TYPES_MAP: Record<ActivityType, boolean> = {
    libre: true,
    defi: true,
    jeu: true,
    enigme: true,
    indice: true,
    reportage: true,
    mascotte: true,
    question: true,
};
export const ACTIVITY_TYPES_ENUM = Object.keys(ACTIVITY_TYPES_MAP) as ActivityType[];

export const phaseActivityTypes = pgTable('phase_activity_types', {
    phase: smallint('phase').primaryKey(),
    activityTypes: jsonb('activity_types').$type<ActivityType[]>().notNull(),
});

export type PhaseActivityType = typeof phaseActivityTypes.$inferSelect;
