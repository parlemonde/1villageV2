'use client';

import { ACTIVITY_NAMES } from '@frontend/components/activities/activities-constants';
import { Button, IconButton } from '@frontend/components/ui/Button';
import { Checkbox } from '@frontend/components/ui/Form/Checkbox';
import { CountrySelect } from '@frontend/components/ui/Form/CountrySelect';
import { Select } from '@frontend/components/ui/Form/Select';
import Pelico from '@frontend/svg/pelico/pelico-neutre.svg';
import { jsonFetcher } from '@lib/json-fetcher';
import { ReloadIcon } from '@radix-ui/react-icons';
import type { Village } from '@server/database/schemas/villages';
import { useState } from 'react';
import useSWR from 'swr';

import styles from './media-filters.module.css';

export function MediaFilters() {
    const [isPelico, setIsPelico] = useState(false);
    const [country, setCountry] = useState('');

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

    const { data: classrooms } = useSWR<Village[]>('/api/classrooms', jsonFetcher);
    const classroomOptions =
        classrooms?.map((classroom) => ({
            label: classroom.name,
            value: classroom.id.toString(),
        })) ?? [];

    return (
        <div className={styles.filters}>
            <Select placeholder="Activités" options={activityOptions} size="sm" />
            <Select placeholder="Thèmes" options={[]} size="sm" />
            <Select placeholder="VM" options={villageOptions} size="sm" />
            <CountrySelect placeholder="Pays" size="sm" value={country} onChange={setCountry} />
            <Select placeholder="Classes" options={classroomOptions} size="sm" />
            <div className={styles['pelico-checkbox']} onClick={() => setIsPelico(!isPelico)}>
                <Checkbox name={'isPelico'} label={<IconButton icon={Pelico} size="sm" variant="borderless" />} isChecked={isPelico} />
            </div>
            <Button
                label={<ReloadIcon width={18} height={18} style={{ minWidth: '24px' }} color={'var(--primary-color)'} />}
                size="md"
                variant="borderless"
            />
        </div>
    );
}
