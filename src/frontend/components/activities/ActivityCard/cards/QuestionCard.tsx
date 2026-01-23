'use client';

import type { ActivityContentCardProps } from '@frontend/components/activities/ActivityCard/activity-card.types';
import { Button } from '@frontend/components/ui/Button';
import { UserContext } from '@frontend/contexts/userContext';
import { useExtracted } from 'next-intl';
import { useContext } from 'react';

export const QuestionCard = ({ activity, onEdit, onDelete, shouldDisableButtons }: ActivityContentCardProps) => {
    const t = useExtracted('QuestionCard');
    const { user } = useContext(UserContext);

    if (activity.type !== 'question') {
        return null;
    }

    const askSameQuestion = () => {
        // TODO
    };

    return (
        <>
            {activity.data?.questions?.map((question) => (
                <p key={question.id}>{question.text}</p>
            ))}
            {onEdit || onDelete ? (
                <div style={{ textAlign: 'right' }}>
                    {onEdit && <Button label="Modifier" variant="contained" color="secondary" onClick={onEdit} />}
                    {onDelete && <Button marginLeft="sm" label="Supprimer" variant="contained" color="error" onClick={onDelete} />}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Button
                        disabled={activity.userId === user.id}
                        onClick={askSameQuestion}
                        label={t('Je me pose la même question')}
                        color="primary"
                        variant="borderless"
                    />
                    <Button
                        disabled={shouldDisableButtons}
                        as={shouldDisableButtons ? 'button' : 'a'}
                        href={`/activities/${activity.id}`}
                        label={t('Répondre à la question')}
                        color="primary"
                    />
                </div>
            )}
        </>
    );
};
