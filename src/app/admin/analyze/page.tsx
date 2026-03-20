'use client';

import { StatisticFilters } from '@frontend/components/statistics/StatisticFilters/StatisticFilters';
import { TeamCommentEditor } from '@frontend/components/statistics/TeamCommentEditor/TeamCommentEditor';
import { VillagesIncludingCountry } from '@frontend/components/statistics/VillagesIncludingCountry/VillagesIncludingCountry';
import { WorldMapActivity } from '@frontend/components/statistics/WorldMapActivity/WorldMapActivity';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { useState } from 'react';

export default function AdminAnalyzePage() {
    const [country, setCountry] = useState('');
    const [village, setVillage] = useState('');
    const [classroom, setClassroom] = useState('');
    const [phase, setPhase] = useState('');

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
        </PageContainer>
    );
}
