'use client';

import { ACTIVITY_NAMES } from '@frontend/components/activities/activities-constants';
import { Button, IconButton } from '@frontend/components/ui/Button';
import { Checkbox } from '@frontend/components/ui/Form/Checkbox';
import { CountrySelect } from '@frontend/components/ui/Form/CountrySelect';
import { Select } from '@frontend/components/ui/Form/Select';
import Pelico from '@frontend/svg/pelico/pelico-neutre.svg';
import { jsonFetcher } from '@lib/json-fetcher';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import { ReloadIcon } from '@radix-ui/react-icons';
import type { Classroom } from '@server/database/schemas/classrooms';
import type { Village } from '@server/database/schemas/villages';
import useSWR from 'swr';

import styles from './media-filters.module.css';

interface MediaFiltersProps {
    isPelico: boolean;
    activity: string;
    country: string;
    village: string;
    classroom: string;
    setIsPelico: (isPelico: boolean) => void;
    setActivity: (activity: string) => void;
    setCountry: (country: string) => void;
    setVillage: (village: string) => void;
    setClassroom: (classroom: string) => void;
    resetFilters: () => void;
}

export function MediaFilters({
    isPelico,
    activity,
    country,
    village,
    classroom,
    setIsPelico,
    setActivity,
    setCountry,
    setVillage,
    setClassroom,
    resetFilters,
}: MediaFiltersProps) {
    const { data: currentVillageResponse } = useSWR<Village[]>(
        village ? `/api/villages${serializeToQueryUrl({ villageId: village })}` : null,
        jsonFetcher,
    );
    const currentVillage = currentVillageResponse?.[0];

    const activityOptions = Object.entries(ACTIVITY_NAMES).map(([key, value]) => ({
        label: value,
        value: key,
    }));

    const { data: villages } = useSWR<Village[]>('/api/villages', jsonFetcher);
    const villageOptions =
        villages?.map((village) => ({
            label: village.name,
            value: village.id.toString(),
        })) ?? [];

    const { data: classrooms } = useSWR<Classroom[]>(`/api/classrooms${serializeToQueryUrl({ villageId: village, country: country })}`, jsonFetcher);
    const classroomOptions =
        classrooms?.map((classroom) => ({
            label: classroom.name,
            value: classroom.id.toString(),
        })) ?? [];

    return (
        <div className={styles.filters}>
            <Select placeholder="Activités" options={activityOptions} size="sm" value={activity} onChange={setActivity} />
            <Select placeholder="Thèmes" options={[]} size="sm" />
            <Select placeholder="VM" options={villageOptions} size="sm" value={village} onChange={setVillage} />
            <CountrySelect
                placeholder="Pays"
                size="sm"
                value={country}
                onChange={setCountry}
                filter={(country) => {
                    if (!currentVillage) return true;
                    return currentVillage?.countries?.includes(country) ?? false;
                }}
            />
            <Select placeholder="Classes" options={classroomOptions} size="sm" value={classroom} onChange={setClassroom} />
            <div className={styles.iconsContainer}>
                <div className={styles['pelico-checkbox']} onClick={() => setIsPelico(!isPelico)}>
                    <Checkbox name={'isPelico'} label={<IconButton icon={Pelico} size="sm" variant="borderless" />} isChecked={isPelico} />
                </div>
                <Button
                    label={<ReloadIcon width={18} height={18} style={{ minWidth: '24px' }} color={'var(--primary-color)'} />}
                    size="md"
                    variant="borderless"
                    onClick={resetFilters}
                />
            </div>
        </div>
    );
}
