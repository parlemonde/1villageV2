import type { StoryElement } from '@server/database/schemas/activity-types';

import { isEmpty } from '../../../utils/helper';

type TaleElement = {
    imageId: number | null;
    imageStory: string | null;
    tale: string | null;
};

const isStoryElement = (data: StoryElement | TaleElement): data is StoryElement => {
    return 'imageUrl' in data && 'description' in data;
};

const isTaleElement = (data: StoryElement | TaleElement): data is TaleElement => {
    return 'imageStory' in data && 'tale' in data;
};

export const stepValid = (data: StoryElement | TaleElement): boolean => {
    if (!data) return false;

    if (isStoryElement(data)) {
        return !isEmpty(data.imageUrl) && !isEmpty(data.description);
    }

    if (isTaleElement(data)) {
        return !isEmpty(data.imageStory) && !isEmpty(data.tale);
    }

    return false;
};

export const getErrorSteps = (data: StoryElement | TaleElement, step: number) => {
    const errorSteps = [];
    if (!stepValid(data)) errorSteps.push(step - 1);
    //step devient un tableau de nombre pour le step 5 et on fait une boucle for [1, 2, 3, 4]

    return errorSteps;
};
