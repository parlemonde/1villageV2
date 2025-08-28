'use client';

import { VillageContext } from '@frontend/contexts/villageContext';
import { useContext } from 'react';

export const Activities = () => {
    const { village, phase } = useContext(VillageContext);
    return (
        <div>
            Activities. Phase {phase}. Village: {village?.name}
        </div>
    );
};
