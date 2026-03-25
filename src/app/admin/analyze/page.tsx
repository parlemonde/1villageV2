'use client';

import { ClassroomsEngagementPie } from '@frontend/components/statistics/ClassroomsEngagementPie/ClassroomsEngagementPie';
import { StatisticFilters } from '@frontend/components/statistics/StatisticFilters/StatisticFilters';
import { StatusComponent } from '@frontend/components/statistics/StatusComponent/StatusComponent';
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
            title: t('En classe'),
        },
        {
            id: 'family',
            title: t('En famille'),
        },
    ];

    const [tab, setTab] = useState<'classroom' | 'family'>('classroom');

    const showWorldComponents = !country && !village && !classroom && !phase;
    const showCountryComponents = country && !village && !classroom;
    const showCountryAndVillageComponents = (country || village) && !classroom;

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

            {(country || village || classroom) && <StatusComponent countryCode={country} villageId={village} classroomId={classroom} marginY="md" />}
            {showCountryComponents && <VillagesIncludingCountry countryCode={country} setVillage={setVillage} />}
            <Tabs tabs={tabs} value={tab} onChange={setTab} marginY="lg" />
            {tab === 'classroom' && showCountryAndVillageComponents && <ClassroomsEngagementPie country={country} villageId={village} />}
        </PageContainer>
    );
}
