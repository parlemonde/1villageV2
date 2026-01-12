'use client';

import { ActivityContext } from '@frontend/contexts/activityContext';
import { UserContext } from '@frontend/contexts/userContext';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import type { Activity } from '@server/database/schemas/activities';
import { useRouter } from 'next/navigation';
import { useContext, useEffect } from 'react';

export default function CreerSaMascottePage() {
    const router = useRouter();
    const { setActivity, onCreateActivity } = useContext(ActivityContext);
    const { user, classroom } = useContext(UserContext);
    const isPelico = user.role === 'admin' || user.role === 'mediator';

    const hasMascot = !!classroom?.avatarUrl;

    useEffect(() => {
        const getMascot = async () => {
            const result = await fetch(`/api/activities${serializeToQueryUrl({ activityId: classroom?.mascotteId })}`);
            if (!result.ok) {
                throw new Error('Failed to get mascot');
            }

            return (await result.json()) as Activity;
        };

        const editMascot = async () => {
            const mascot = await getMascot();
            setActivity(mascot);
        };

        if (hasMascot) {
            editMascot();
        } else {
            onCreateActivity('mascotte', isPelico);
        }
        router.push('/creer-sa-mascotte/1');
    }, [isPelico, onCreateActivity, router, setActivity, hasMascot, classroom?.mascotteId]);
}
