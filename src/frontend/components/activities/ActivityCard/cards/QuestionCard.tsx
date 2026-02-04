'use client';

import type { ActivityContentCardProps } from '@frontend/components/activities/ActivityCard/activity-card.types';
import { Button } from '@frontend/components/ui/Button';
import { UserContext } from '@frontend/contexts/userContext';
import { askSameQuestion } from '@server-actions/activities/ask-same-question';
import { useExtracted } from 'next-intl';
import { useContext } from 'react';

export const QuestionCard = ({ activity, onEdit, onDelete, action, shouldDisableButtons }: ActivityContentCardProps) => {
    const t = useExtracted('QuestionCard');
    const { user, classroom } = useContext(UserContext);

    if (activity.type !== 'question') {
        return null;
    }

    const isPelico = user.role === 'admin' || user.role === 'mediator';
    const showAskSameButton = action && activity.userId !== user.id && !isPelico;

    const onClick = async () => {
        if (!classroom?.id) {
            return;
        }

        if (activity.data?.isAskingSameQuestion?.includes(classroom.id)) {
            const newArray = activity.data?.isAskingSameQuestion?.filter((classroomId) => classroomId != classroom?.id);
            const newValue = newArray.length === 0 ? undefined : newArray;
            await askSameQuestion({
                id: activity.id,
                data: {
                    ...activity.data,
                    isAskingSameQuestion: newValue,
                },
            });
            onEdit?.();
        } else {
            await askSameQuestion({
                id: activity.id,
                data: {
                    ...activity.data,
                    isAskingSameQuestion: [...(activity.data?.isAskingSameQuestion || []), classroom.id],
                },
            });
            onEdit?.();
        }
    };

    return (
        <>
            <div style={{ marginBottom: '8px' }}>
                {activity.data?.questions?.map((question) => (
                    <p key={question.id}>{question.text}</p>
                ))}
            </div>
            {onEdit || onDelete ? (
                <div style={{ textAlign: 'right' }}>
                    {onEdit && <Button label="Modifier" variant="contained" color="secondary" onClick={onEdit} />}
                    {onDelete && <Button marginLeft="sm" label="Supprimer" variant="contained" color="error" onClick={onDelete} />}
                </div>
            ) : (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: showAskSameButton ? 'space-between' : 'flex-end',
                    }}
                >
                    {showAskSameButton && (
                        <div style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                            <Button
                                onClick={onClick}
                                label={t('Je me pose la même question')}
                                color="primary"
                                variant={classroom?.id && activity.data?.isAskingSameQuestion?.includes(classroom.id) ? 'contained' : 'borderless'}
                            />
                            {activity?.data?.isAskingSameQuestion && (
                                <p style={{ fontSize: '18px', color: 'var(--primary-color)' }}>+{activity?.data?.isAskingSameQuestion?.length}</p>
                            )}
                        </div>
                    )}
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
