'use client';

import type { ActivityContentCardProps } from '@frontend/components/activities/ActivityCard/activity-card.types';
import { Button } from '@frontend/components/ui/Button';
import { UserContext } from '@frontend/contexts/userContext';
import { useExtracted } from 'next-intl';
import { useContext } from 'react';

export const GameCard = ({ activity, onEdit, onDelete, shouldDisableButtons }: ActivityContentCardProps) => {
    const tCommon = useExtracted('common');

    const { user } = useContext(UserContext);

    if (activity.type !== 'jeu') {
        return null;
    }

    return (
        <div style={{ textAlign: 'right' }}>
            {onEdit || onDelete ? (
                <>
                    {onEdit && <Button color="secondary" variant="contained" onClick={onEdit} label={tCommon('Modifier')} />}
                    {onDelete && <Button color="error" variant="contained" onClick={onDelete} label={tCommon('Supprimer')} />}
                </>
            ) : (
                <Button
                    as={shouldDisableButtons || activity.userId === user?.id ? 'button' : 'a'}
                    disabled={shouldDisableButtons || activity.userId === user?.id}
                    href={shouldDisableButtons ? undefined : `/activities/${activity.id}`}
                    color="primary"
                    label={tCommon('Jouer')}
                />
            )}
        </div>
    );
};
