import { IconButton } from '@frontend/components/ui/Button';
import { Tooltip } from '@frontend/components/ui/Tooltip/Tooltip';
import { Pencil1Icon } from '@radix-ui/react-icons';
import classNames from 'clsx';
import React from 'react';

import styles from './activity-step-preview.module.css';

interface ActivityStepPreviewProps {
    status?: 'success' | 'warning';
    stepName: string;
    href: string;
    style?: React.CSSProperties;
}
export const ActivityStepPreview = ({ status = 'success', stepName, href, style, children }: React.PropsWithChildren<ActivityStepPreviewProps>) => {
    return (
        <div className={classNames(styles.activityStepPreview, styles[`status-${status}`])} style={style}>
            <span className={styles.stepName}>{stepName}</span>
            <div className={styles.activityStepPreviewContent}>
                <Tooltip content="Modifier">
                    <IconButton
                        as="a"
                        href={href}
                        icon={Pencil1Icon}
                        variant="outlined"
                        color={status === 'success' ? 'secondary' : 'warning'}
                        className={styles.EditButton}
                    />
                </Tooltip>
                {children}
            </div>
        </div>
    );
};
