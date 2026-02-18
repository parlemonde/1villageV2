'use client';

import { ActivityContext } from '@frontend/contexts/activityContext';
import { UserContext } from '@frontend/contexts/userContext';
import { useRouter } from 'next/navigation';
import { useContext, useEffect } from 'react';

export default function PoserUneQuestionPage() {
    const router = useRouter();
    const { onCreateActivity } = useContext(ActivityContext);
    const { user } = useContext(UserContext);
    const isPelico = user.role === 'admin' || user.role === 'mediator';

    useEffect(() => {
        onCreateActivity('question', isPelico, {
            questions: [{ id: 1, text: '' }],
        });

        router.push('/poser-une-question/1');
    }, [isPelico, onCreateActivity, router]);

    return null;
}
