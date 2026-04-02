'use client';

import { ClassroomsEngagementPie } from '@frontend/components/statistics/ClassroomsEngagementPie/ClassroomsEngagementPie';
import { StatisticFilters } from '@frontend/components/statistics/StatisticFilters/StatisticFilters';
import { TeamCommentEditor } from '@frontend/components/statistics/TeamCommentEditor/TeamCommentEditor';
import { VillagesIncludingCountry } from '@frontend/components/statistics/VillagesIncludingCountry/VillagesIncludingCountry';
import { WorldMapActivity } from '@frontend/components/statistics/WorldMapActivity/WorldMapActivity';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Tabs } from '@frontend/components/ui/Tabs/Tabs';
import { useExtracted } from 'next-intl';
import { useState } from 'react';

export default function AdminAnalyzePage() {
    const t = useExtracted('app.admin.analyze');

    const [country, setCountry] = useState('');
    const [village, setVillage] = useState('');
    const [classroom, setClassroom] = useState('');
    const [phase, setPhase] = useState('');

    const tabs = [
        {
            id: 'classroom',
            title: t('EN CLASSE'),
        },
        {
            id: 'family',
            title: t('EN FAMILLE'),
        },
    ];

    const [tab, setTab] = useState<'classroom' | 'family'>('classroom');

    const showWorldComponents = !country && !village && !classroom && !phase;

    return (
        <PageContainer title="Analyser">
            <TeamCommentEditor />
            <StatisticFilters
                country={country}
                village={village}
                classroom={classroom}
                phase={phase}
                setCountry={setCountry}
                setVillage={setVillage}
                setClassroom={setClassroom}
                setPhase={setPhase}
            />
            {showWorldComponents && <WorldMapActivity setCountry={setCountry} />}
            {country && <VillagesIncludingCountry countryCode={country} setVillage={setVillage} />}
            <Tabs tabs={tabs} value={tab} onChange={setTab} marginY="lg" />
            {tab === 'classroom' && country && <ClassroomsEngagementPie country={country} villageId={village} />}
        </PageContainer>
    );
}
