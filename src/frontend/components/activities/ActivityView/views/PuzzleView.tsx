import { ActivityResponseButton } from '@frontend/components/activities/ActivityTimer/ActivityTimer';
import type { ActivityContentViewProps } from '@frontend/components/activities/ActivityView/activity-view.types';
import { ContentViewer } from '@frontend/components/content/ContentViewer';
import { Button } from '@frontend/components/ui/Button/Button';
import classNames from 'clsx';
import { useExtracted } from 'next-intl';
import { useState } from 'react';

import styles from './puzzle-view.module.css';

export const PuzzleView = ({ activity }: ActivityContentViewProps) => {
    const tCommon = useExtracted('common');
    const [hintVisible, setHintVisible] = useState(false);
    const themeLabel = activity?.type === 'enigme' ? activity.data?.defaultTheme : tCommon('Autre thème');
    const hasHintValue = activity?.type === 'enigme' ? activity.data?.defaultTheme !== 'Autre thème' : false;

    if (activity.type !== 'enigme') {
        return null;
    }

    return (
        <>
            <div className={classNames(styles.puzzleViewTitle)}>{themeLabel}</div>
            <ContentViewer content={activity.data?.content} activityId={activity.id} marginTop={20} marginBottom={50} />
            <div className={classNames(styles.puzzleViewFooter)}>
                {hasHintValue && (
                    <Button
                        color="primary"
                        variant="outlined"
                        label={tCommon('Obtenir un autre indice')}
                        onClick={() => setHintVisible(!hintVisible)}
                    />
                )}
                <ActivityResponseButton activity={activity} />
            </div>
            {hintVisible && (
                <div className={styles.hintSection}>
                    <div className={styles.hintHeader}>indice supplémentaire</div>
                    {tCommon("L'indice supplémentaire est {hint}", { hint: activity.data?.customTheme || '' })}
                </div>
            )}
        </>
    );
};
