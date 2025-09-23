'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import * as React from 'react';

export const NProgressDone = () => {
    const pathName = usePathname();
    const searchParams = useSearchParams();

    React.useEffect(() => {
        NProgress.done();
    }, [pathName, searchParams]);

    return null;
};
