import { UserContext } from '@frontend/contexts/userContext';
import { EyeOpenIcon } from '@radix-ui/react-icons';
import type { Activity } from '@server/database/schemas/activities';
import { updateActivityViews } from '@server-actions/activities/update-nb-views';
import { usePathname } from 'next/navigation';
import { useExtracted } from 'next-intl';
import React, { useEffect, useContext } from 'react';

import styles from './user-views.module.css';

interface UserViewsProps {
    activity: Activity;
}

export const UserViews: React.FC<UserViewsProps> = ({ activity }) => {
    const { user } = useContext(UserContext);
    const t = useExtracted('UserViews');
    const pathname = usePathname();
    const isOnActivityPage = pathname.startsWith('/activities/');
    const nbVues = activity.views?.length || 0;

    useEffect(() => {
        const isPelico = user.role === 'admin' || user.role === 'mediator';
        const shouldUpdateViews = isOnActivityPage && activity.userId !== user.id && !isPelico;
        if (shouldUpdateViews) {
            updateActivityViews(activity);
        }
    }, [user, activity, isOnActivityPage]);

    return (
        <>
            <div className={styles.userViews}>
                <EyeOpenIcon className={styles.userViewsIcon} width={24} height={24} />
                {isOnActivityPage ? (
                    <span className={styles.userViewsNumberLarge}>
                        {t(
                            "{count, plural, =0 {aucune classe n'a vu cette activité} =1 {# classe a vu cette activité} other {# classes ont vu cette activité}}",
                            {
                                count: nbVues,
                            },
                        )}
                    </span>
                ) : (
                    <span className={styles.userViewsNumberSmall}>
                        {t('{count, plural, =0 {aucune vue} =1 {# vue} other {# vues}}', { count: nbVues })}
                    </span>
                )}
            </div>
        </>
    );
};
