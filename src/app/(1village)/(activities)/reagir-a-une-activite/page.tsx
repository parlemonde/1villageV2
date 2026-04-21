'use client';

import { ActivityContext } from '@frontend/contexts/activityContext';
import { UserContext } from '@frontend/contexts/userContext';
import { useRouter } from 'next/navigation';
import { useContext, useEffect } from 'react';

export default function ReagirAUneActivitePage() {
    const router = useRouter();
    const { onCreateActivity } = useContext(ActivityContext);
    const { user } = useContext(UserContext);
    const isPelico = user.role === 'admin' || user.role === 'mediator';

    useEffect(() => {
        onCreateActivity('reaction', isPelico);
        router.push('/reagir-a-une-activite/1');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}
