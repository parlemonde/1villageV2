import type { AnyContent } from '@frontend/components/content/content.types';

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

export type Activities = FreeActivity | GameActivity | PuzzleActivity;
