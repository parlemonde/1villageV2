'use client';

import { usePathname } from 'next/navigation';

export const ActivitySidePanel = () => {
    const pathname = usePathname();

    const isOnActivityPage = pathname.startsWith('/activities/');

    if (!isOnActivityPage) {
        return null;
    }

    return <div style={{ width: '300px' }}>ActivitySidePanel</div>;
};
