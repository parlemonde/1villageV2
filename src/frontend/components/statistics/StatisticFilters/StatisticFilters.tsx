'use client';
import { CountrySelect } from '@frontend/components/ui/Form/CountrySelect';
import { Select } from '@frontend/components/ui/Form/Select';
import { jsonFetcher } from '@lib/json-fetcher';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import type { Classroom } from '@server/database/schemas/classrooms';
import type { Village } from '@server/database/schemas/villages';
import { useExtracted } from 'next-intl';
import useSWR from 'swr';

import styles from './statistic-filters.module.css';

interface StatisticFiltersProps {
    country: string;
    village: string;
    classroom: string;
    phase: string;
    setCountry: (country: string) => void;
    setVillage: (village: string) => void;
    setClassroom: (classroom: string) => void;
    setPhase: (phase: string) => void;
}

export const StatisticFilters = ({ country, village, classroom, phase, setCountry, setVillage, setClassroom, setPhase }: StatisticFiltersProps) => {
    const t = useExtracted('StatisticFilters');

    const { data: villages } = useSWR<Village[]>(`/api/villages${serializeToQueryUrl({ country: country })}`, jsonFetcher);
    const villageOptions = villages?.map((village) => ({ label: village.name, value: village.id.toString() })) ?? [];

    const { data: classrooms } = useSWR<Classroom[]>(`/api/classrooms${serializeToQueryUrl({ country: country, villageId: village })}`, jsonFetcher);
    const classroomOptions = classrooms?.map((classroom) => ({ label: classroom.name, value: classroom.id.toString() })) ?? [];

    const phasesOptions = [
        { label: t('Phase 1'), value: '1' },
        { label: t('Phase 2'), value: '2' },
        { label: t('Phase 3'), value: '3' },
    ];

    const selectVillage = (value: string) => {
        setVillage(value);
        setClassroom('');
    };

    const selectCountry = (value: string) => {
        setCountry(value);
        setVillage('');
        setClassroom('');
    };

    const { data: countryOptions } = useSWR<string[]>(`/api/available-countries`, jsonFetcher);

    const enhancedVillageOptions = villageOptions.length > 0 ? villageOptions : [{ label: t('Aucun village'), value: 'none' }];
    const enhancedClassroomOptions = classroomOptions.length > 0 ? classroomOptions : [{ label: t('Aucune classe'), value: 'none' }];

    return (
        <div className={styles.container}>
            <CountrySelect
                hasCross
                onChange={selectCountry}
                value={country}
                placeholder={t('Pays')}
                filter={(country) => countryOptions?.includes(country) ?? false}
            />
            <Select hasCross placeholder={t('Village')} options={enhancedVillageOptions} value={village} onChange={selectVillage} />
            <Select hasCross placeholder={t('Classe')} options={enhancedClassroomOptions} value={classroom} onChange={setClassroom} />
            <Select hasCross placeholder={t('Phase')} options={phasesOptions} value={phase} onChange={setPhase} />
        </div>
    );
};
