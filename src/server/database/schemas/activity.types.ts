type FreeActivity = {
    type: 'libre';
    content: {
        text: string;
        title: string;
        resume: string;
    } | null;
};

type GameActivity = {
    type: 'jeu';
    content: {
        gameId: string;
    } | null;
};

type PuzzleActivity = {
    type: 'enigme';
    content: {
        text: string;
    } | null;
};

export type Activities = FreeActivity | GameActivity | PuzzleActivity;
