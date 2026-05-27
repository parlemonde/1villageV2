'use client';

import { UserContext } from '@frontend/contexts/userContext';
import { VillageContext } from '@frontend/contexts/villageContext';
import { useContext } from 'react';

import { FirstPhase } from './FirstPhase';
import { SecondPhase } from './SecondPhase';
import { ThirdPhase } from './ThirdPhase';
import { UnassignedVillageModal } from './UnassignedVillageModal';

export const WelcomeModal = () => {
    const { user } = useContext(UserContext);
    const { village } = useContext(VillageContext);

    if (!user || user.role !== 'teacher') {
        return null;
    }

    if (!village) {
        return <UnassignedVillageModal />;
    }

    if (user.firstLogin === 0) {
        return <FirstPhase />;
    }
    if (user.firstLogin === 1 && village.activePhase > 1) {
        return <SecondPhase />;
    }
    if (user.firstLogin === 2 && village.activePhase > 2) {
        return <ThirdPhase />;
    }

    return null;
};
