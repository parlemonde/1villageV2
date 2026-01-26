import type { StoryElement } from '@server/database/schemas/activity-types';

type TaleElement = {
    imageId: number | null;
    imageStory: string | null;
    tale: string | null;
};

export const stepValid = (data: Record<string, unknown>): boolean => {
    //verifier si data.imageUrl === '' et data.description === ''
    //verifier si data.imageStory === '' et data.tale === ''
    if (data.imageUrl === '') return false;
    if (data.description === '') return false;
    if (data.imageStory === '') return false;
    if (data.tale === '') return false;
    return true;
};

export const getErrorSteps = (data: StoryElement | TaleElement, step: number) => {
    const errorSteps = [];
    if (!stepValid(data)) errorSteps.push(step - 1);
    //step devient un tableau de nombre pour le step 5 et on fait une boucle for [1, 2, 3, 4]

    return errorSteps;
};
