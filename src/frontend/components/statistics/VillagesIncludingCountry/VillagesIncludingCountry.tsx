'use client';

import type { VillageCountryStatus } from '@app/api/statistics/country/[id]/villages/route';
import { statusColors } from '@frontend/components/statistics/utils/statusColors';
import { CircularProgress } from '@frontend/components/ui/CircularProgress';
import { jsonFetcher } from '@lib/json-fetcher';
import { useExtracted } from 'next-intl';
import useSWR from 'swr';

import styles from './villages-including-country.module.css';

interface VillagesIncludingCountryProps {
    countryCode: string;
    setVillage: (villageId: string) => void;
}

export const VillagesIncludingCountry = ({ countryCode, setVillage }: VillagesIncludingCountryProps) => {
    const t = useExtracted('VillagesIncludingCountry');

    const { data: villages, isLoading } = useSWR<VillageCountryStatus[]>(`/api/statistics/country/${countryCode}/villages`, jsonFetcher);

    return (
        <div className={styles.container}>
            {!isLoading && villages?.length === 0 ? (
                <p className={styles.heading}>{t('Ce pays ne participe dans aucun village-monde.')}</p>
            ) : (
                <p className={styles.heading}>{t('Ce pays participe dans les villages-monde suivants :')}</p>
            )}
            <div className={styles.villageList}>
                {isLoading ? (
                    <CircularProgress />
                ) : (
                    villages?.map((village) => (
                        <div key={village.villageId} className={styles.villageItem} onClick={() => setVillage(village.villageId.toString())}>
                            <div className={styles.statusColor} style={{ backgroundColor: statusColors[village.status] }} />
                            <span>{village.villageName}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
