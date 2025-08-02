'use client';

import { useContext } from 'react';

import { VillageContext } from '@/contexts/villageContext';

export const Activities = () => {
    const { village, phase } = useContext(VillageContext);
    return (
        <div>
            Activities. Phase {phase}. Village: {village?.name}
        </div>
    );
};
