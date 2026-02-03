'use client';

import { Button } from '@frontend/components/ui/Button';
import TimerIcon from '@frontend/svg/enigmes/timer.svg';
import type { Activity } from '@server/database/schemas/activities';
import classNames from 'clsx';
import { useExtracted } from 'next-intl';

import styles from './activity-timer.module.css';

interface ActivityTimerProps {
    activity: Partial<Activity>;
    onClick?: () => void;
}

export const ActivityTimer = ({ activity }: ActivityTimerProps) => {
    const tCommon = useExtracted('common');

    const publishDate = activity.publishDate;

    if (!publishDate) {
        return null;
    }

    const published = new Date(publishDate ?? '');
    const now = new Date();
    const diffInMs = now.getTime() - published.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    return (
        <span className={classNames(styles.activityTimer, { [styles.unavailable]: diffInDays > 0 })}>
            <TimerIcon style={{ width: '20px', height: 'auto', marginRight: 4 }} />
            {diffInDays > 0 ? <>{tCommon('Temps restant: {rest} jours', { rest: diffInDays.toString() })}</> : <>{tCommon('Réponse disponible')}</>}
        </span>
    );
};

export const ActivityResponseButton = ({ activity, onClick }: ActivityTimerProps) => {
    const tCommon = useExtracted('common');

    const publishDate = activity.publishDate;

    if (!publishDate) {
        return null;
    }

    const published = new Date(publishDate ?? '');
    const now = new Date();
    const diffInMs = now.getTime() - published.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const isDisabled = diffInDays > 0;

    return (
        <Button
            as={isDisabled ? 'button' : 'a'}
            disabled={isDisabled}
            href={isDisabled ? undefined : `/activities/${activity.id}?response=true`}
            color="primary"
            variant="outlined"
            isUpperCase={false}
            onClick={isDisabled ? undefined : onClick}
            label={
                isDisabled ? (
                    <>
                        {tCommon("Voir la réponse à l'énigme")}
                        <span className={classNames(styles.activityResponseButtonTimer)}>
                            <TimerIcon style={{ width: '20px', height: 'auto', marginX: 4 }} />
                            {tCommon('{rest} jours', { rest: diffInDays.toString() })}
                        </span>
                    </>
                ) : (
                    tCommon("Voir la réponse à l'énigme")
                )
            }
        />
    );
};
