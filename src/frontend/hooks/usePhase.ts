import { VillageContext } from '@frontend/contexts/villageContext';
import { useContext } from 'react';

import { useSessionStorage } from './useSessionStorage';

export const usePhase = (): [number | null, (value: number | null) => void] => {
    const { village } = useContext(VillageContext);
    const [phaseFromStorage, setPhaseFromStorage] = useSessionStorage<number | null>('phase', null);
    const phase = phaseFromStorage ?? village?.activePhase ?? null;

    return [phase, setPhaseFromStorage];
};
