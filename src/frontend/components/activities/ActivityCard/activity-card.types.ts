import type { Activity } from '@server/database/schemas/activities';
import type React from 'react';

export type ActivityContentCardProps = {
    activity: Partial<Activity>;
    shouldDisableButtons: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
    hasActions?: boolean;
    children?: React.ReactNode;
};
