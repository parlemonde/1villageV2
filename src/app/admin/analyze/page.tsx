'use client';

import { StatisticFilters } from '@frontend/components/statistics/StatisticFilters/StatisticFilters';
import { TeamCommentEditor } from '@frontend/components/statistics/TeamCommentEditor/TeamCommentEditor';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { useState } from 'react';

export default function AdminAnalyzePage() {
    const [country, setCountry] = useState('');
    const [village, setVillage] = useState('');
    const [classroom, setClassroom] = useState('');
    const [phase, setPhase] = useState('');

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
        </PageContainer>
    );
}
