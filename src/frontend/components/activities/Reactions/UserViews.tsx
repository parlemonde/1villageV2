import type { MarginProps, PaddingProps } from '@frontend/components/ui/css-styles';
import { getMarginAndPaddingProps, getMarginAndPaddingStyle } from '@frontend/components/ui/css-styles';
import { EyeOpenIcon } from '@radix-ui/react-icons';
import type { Activity } from '@server/database/schemas/activities';
import { usePathname } from 'next/navigation';
import { useExtracted } from 'next-intl';
import React from 'react';

import styles from './user-views.module.css';

interface UserViewsProps extends MarginProps, PaddingProps {
    activity: Partial<Activity>;
}

export const UserViews: React.FC<UserViewsProps> = ({ activity, ...props }) => {
    const t = useExtracted('UserViews');
    const pathname = usePathname();
    const isOnActivityPage = pathname.startsWith('/activities/');
    const nbVues = activity.views?.length || 0;
    const { marginAndPaddingProps } = getMarginAndPaddingProps(props);
    const marginAndPaddingStyle = { ...{ marginTop: '32px', marginBottom: '32px' }, ...getMarginAndPaddingStyle(marginAndPaddingProps) };

    return (
        <div className={styles.userViews} style={marginAndPaddingStyle}>
            <EyeOpenIcon className={styles.userViewsIcon} width={24} height={24} />
            {isOnActivityPage ? (
                <span>
                    {t(
                        "{count, plural, =0 {aucune classe n'a vu cette activité} =1 {# classe a vu cette activité} other {# classes ont vu cette activité}}",
                        {
                            count: nbVues,
                        },
                    )}
                </span>
            ) : (
                <span>{t('{count, plural, =0 {aucune vue} =1 {# vue} other {# vues}}', { count: nbVues })}</span>
            )}
        </div>
    );
};
