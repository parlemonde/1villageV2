import type { QuestionActivity } from '@server/database/schemas/activity-types';

export const QUESTION_STEPS_VALIDATORS = {
    isStep2Valid(activity: Partial<QuestionActivity>) {
        return (
            activity.data?.questions &&
            activity.data.questions.length > 0 &&
            activity.data.questions.length <= 3 &&
            activity.data.questions.every((question) => question.text)
        );
    },
};
