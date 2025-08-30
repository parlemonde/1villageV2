import { VillageContext } from '@frontend/contexts/villageContext';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useContext } from 'react';

export const usePhase = (): [number | null, (value: number | null) => void] => {
    const { village } = useContext(VillageContext);
    const [phaseUrl, setPhase] = useQueryState(
        'phase',
        parseAsInteger.withOptions({
            history: 'push',
        }),
    );
    const phase = phaseUrl ?? village?.activePhase ?? null;
    return [phase, setPhase];
};
