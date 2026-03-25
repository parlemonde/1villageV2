'use client';

import type { Status } from '@frontend/components/statistics/utils/status.type';
import { statusColors } from '@frontend/components/statistics/utils/statusColors';
import { useStatusLabels } from '@frontend/components/statistics/utils/useStatusLabels';
import { getMarginAndPaddingStyle, type MarginProps } from '@frontend/components/ui/css-styles';
import { jsonFetcher } from '@lib/json-fetcher';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import { useExtracted } from 'next-intl';
import useSWR from 'swr';

import styles from './status-component.module.css';

const useStatusText = ({ countryCode, villageId, classroomId }: StatusComponentProps) => {
    const t = useExtracted('StatusComponent');

    if (classroomId) {
        return t('Statut de la classe');
    }
    if (villageId) {
        return t('Statut du village-monde');
    }
    if (countryCode) {
        return t('Statut du pays');
    }
};

interface StatusComponentProps extends MarginProps {
    countryCode?: string;
    villageId?: string;
    classroomId?: string;
}

export const StatusComponent = ({ countryCode, villageId, classroomId, ...props }: StatusComponentProps) => {
    const { data: status } = useSWR<Status>(
        `/api/statistics/status${serializeToQueryUrl({ countryCode: countryCode, villageId: villageId, classroomId: classroomId })}`,
        jsonFetcher,
    );
    const labels = useStatusLabels();
    const statusText = useStatusText({ countryCode, villageId, classroomId });

    return (
        status && (
            <div className={styles.container} style={getMarginAndPaddingStyle(props)}>
                <strong>
                    {statusText}: {labels[status]}
                </strong>
                <div className={styles.dot} style={{ backgroundColor: statusColors[status] }} />
            </div>
        )
    );
};
