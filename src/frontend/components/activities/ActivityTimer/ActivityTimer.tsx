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

const DAYS_TO_WAIT_FOR_ANSWER = 7;

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
    const isUnavailable = diffInDays < DAYS_TO_WAIT_FOR_ANSWER;

    return (
        <span className={classNames(styles.activityTimer, { [styles.unavailable]: isUnavailable })}>
            <TimerIcon style={{ width: '20px', height: 'auto', marginRight: 4 }} />
            {isUnavailable ? (
                <>{tCommon('Temps restant: {rest} jours', { rest: (DAYS_TO_WAIT_FOR_ANSWER - diffInDays).toString() })}</>
            ) : (
                <>{tCommon('Réponse disponible')}</>
            )}
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
    const isDisabled = diffInDays < DAYS_TO_WAIT_FOR_ANSWER;

    return (
        <Button
            as={isDisabled ? 'button' : 'a'}
            disabled={isDisabled}
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
                            {tCommon('{rest} jours', { rest: (DAYS_TO_WAIT_FOR_ANSWER - diffInDays).toString() })}
                        </span>
                    </>
                ) : (
                    tCommon("Voir la réponse à l'énigme")
                )
            }
        />
    );
};
