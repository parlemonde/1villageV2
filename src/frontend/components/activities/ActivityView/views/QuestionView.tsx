'use client';

import type { ActivityContentViewProps } from '@frontend/components/activities/ActivityView/activity-view.types';
import { useExtracted } from 'next-intl';

export const QuestionView = ({ activity }: ActivityContentViewProps) => {
    const t = useExtracted('QuestionView');

    if (activity.type !== 'question') {
        return null;
    }
    return (
        <div style={{ margin: '32px 0' }}>
            {activity.data?.questions?.map((question, index) => (
                <div style={{ marginBottom: '16px' }} key={question.id}>
                    <p>
                        <strong>
                            {t('Question')} {index + 1}
                        </strong>
                    </p>
                    <p>{question.text}</p>
                </div>
            ))}
        </div>
    );
};
