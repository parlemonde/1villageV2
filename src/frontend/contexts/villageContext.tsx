'use client';

import type { Village } from '@server/database/schemas/villages';
import { createContext, useMemo } from 'react';

export const VillageContext = createContext<{
    village: Village | undefined;
}>({
    village: undefined,
});

interface VillageProviderProps {
    village: Village | undefined;
}
export const VillageProvider = ({ village, children }: React.PropsWithChildren<VillageProviderProps>) => {
    const value = useMemo(() => ({ village }), [village]);
    return <VillageContext.Provider value={value}>{children}</VillageContext.Provider>;
};
