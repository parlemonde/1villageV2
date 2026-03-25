'use client';
import type { ClassroomInfo } from '@app/api/statistics/classrooms/[id]/info/route';
import { Title } from '@frontend/components/ui/Title';
import { getMarginAndPaddingStyle, type MarginProps } from '@frontend/components/ui/css-styles';
import { WorldMap2D } from '@frontend/components/worldMaps/WorldMap2D';
import { COUNTRIES } from '@lib/iso-3166-countries-french';
import { jsonFetcher } from '@lib/json-fetcher';
import { useExtracted } from 'next-intl';
import useSWR from 'swr';

import styles from './classroom-card.module.css';

interface ClassroomCardProps extends MarginProps {
    classroomId: string;
}

export const ClassroomCard = ({ classroomId, ...props }: ClassroomCardProps) => {
    const t = useExtracted('ClassroomCard');

    const { data: classroom } = useSWR<ClassroomInfo>(`/api/statistics/classrooms/${classroomId}/info`, jsonFetcher);
    if (!classroom) {
        return null;
    }

    return (
        <div className={styles.container} style={getMarginAndPaddingStyle(props)}>
            <WorldMap2D coordinates={classroom.coordinates} width="300px" style={{ borderRadius: '10px' }} />
            <div className={styles.info}>
                <Title variant="h3" marginBottom="md">
                    {classroom?.alias ?? `Les ${classroom.level} de ${classroom.name}`}
                </Title>
                <p>
                    <span style={{ textDecoration: 'fromFont' }}>{t('Adresse')}</span> : {classroom.address}
                </p>
                <p>
                    {t('Pays')} : {COUNTRIES[classroom.countryCode]}
                </p>
                <p>
                    {t('Village-Monde')} : {classroom.villageName}
                </p>
                <p>
                    {t('Adresse Mail')} : {classroom.email}
                </p>
                <p>
                    {t('Dernière connexion')} : {classroom.lastSeen ? classroom.lastSeen.toString() : t("Ne s'est jamais connecté")}
                </p>
                <p>
                    {t('Professeur')} : {classroom.teacherName}
                </p>
            </div>
        </div>
    );
};
