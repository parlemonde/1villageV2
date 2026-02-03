import { ActivityResponseButton } from '@frontend/components/activities/ActivityTimer/ActivityTimer';
import type { ActivityContentViewProps } from '@frontend/components/activities/ActivityView/activity-view.types';
import { CUSTOM_THEME_VALUE } from '@frontend/components/activities/enigme-constants';
import { ContentViewer } from '@frontend/components/content/ContentViewer';
import { Button } from '@frontend/components/ui/Button/Button';
import ArrowDownIcon from '@frontend/svg/arrowDown.svg';
import classNames from 'clsx';
import { useExtracted } from 'next-intl';
import { useState } from 'react';

import styles from './puzzle-view.module.css';

export const PuzzleView = ({ activity }: ActivityContentViewProps) => {
    const tCommon = useExtracted('common');
    const [hintVisible, setHintVisible] = useState(false);
    const [answerVisible, setAnswerVisible] = useState(false);

    if (activity.type !== 'enigme') {
        return null;
    }

    const themeLabel = activity.data?.defaultTheme || tCommon.rich('{text}', { text: CUSTOM_THEME_VALUE });
    const hasHintValue = activity.data?.defaultTheme !== CUSTOM_THEME_VALUE;

    return (
        <>
            <div className={classNames(styles.puzzleViewTitle)}>{themeLabel}</div>
            <ContentViewer content={activity.data?.content} activityId={activity.id} marginTop={20} marginBottom={50} />

            {answerVisible ? (
                <ContentViewer content={activity.data?.answer} activityId={activity.id} marginTop={20} marginBottom={50} />
            ) : (
                <>
                    <div className={classNames(styles.puzzleViewFooter)}>
                        {hasHintValue && (
                            <Button
                                color="primary"
                                variant="borderless"
                                label={tCommon('Obtenir un autre indice')}
                                isUpperCase={false}
                                className={classNames(styles.hintButton, { [styles.hintOpen]: hintVisible })}
                                rightIcon={<ArrowDownIcon className={styles.icon} style={{ width: '20px', fill: 'var(--primary-color)' }} />}
                                onClick={() => setHintVisible(!hintVisible)}
                            />
                        )}
                        <ActivityResponseButton activity={activity} onClick={() => setAnswerVisible(!answerVisible)} />
                    </div>
                    {hintVisible && (
                        <div className={styles.hintSection}>
                            <div className={styles.hintHeader}>indice supplémentaire</div>
                            {tCommon("L'indice supplémentaire est {hint}", { hint: activity.data?.customTheme || '' })}
                        </div>
                    )}
                </>
            )}
        </>
    );
};
