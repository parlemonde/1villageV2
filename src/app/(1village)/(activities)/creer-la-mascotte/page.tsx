'use client';

import { ActivityContext } from '@frontend/contexts/activityContext';
import { UserContext } from '@frontend/contexts/userContext';
import { useRouter } from 'next/navigation';
import { useContext, useEffect } from 'react';

export default function CreerLaMascottePage() {
    const router = useRouter();
    const { onCreateActivity } = useContext(ActivityContext);
    const { user } = useContext(UserContext);
    const isPelico = user.role === 'admin' || user.role === 'mediator';

    useEffect(() => {
        onCreateActivity('mascotte', isPelico);
        router.push('/creer-la-mascotte/1');
    }, [isPelico, onCreateActivity, router]);
}
