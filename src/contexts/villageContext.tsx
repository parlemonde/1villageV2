'use client';

import { createContext, useMemo, useState } from 'react';

import type { Village } from '@/database/schemas/villages';

export const VillageContext = createContext<{
    village: Village | undefined;
    phase: number;
    setPhase: (phase: number) => void;
}>({
    village: undefined,
    phase: 1,
    setPhase: () => {},
});

interface VillageProviderProps {
    village: Village | undefined;
}
export const VillageProvider = ({ village, children }: React.PropsWithChildren<VillageProviderProps>) => {
    const [phase, setPhase] = useState(village?.activePhase ?? 1);
    const value = useMemo(() => ({ village, phase, setPhase }), [village, phase, setPhase]);
    return <VillageContext.Provider value={value}>{children}</VillageContext.Provider>;
};
