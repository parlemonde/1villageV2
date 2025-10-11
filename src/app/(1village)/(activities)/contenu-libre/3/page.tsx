'use client';

import { ActivityCard } from '@frontend/components/activities/ActivityCard';
import { ActivityStepPreview } from '@frontend/components/activities/ActivityStepPreview';
import { FreeContentView } from '@frontend/components/activities/ActivityView/FreeContentView';
import { Button } from '@frontend/components/ui/Button';
import { Loader } from '@frontend/components/ui/Loader';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { UserContext } from '@frontend/contexts/userContext';
import { ChevronLeftIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import { useContext, useMemo, useState } from 'react';

export default function FreeContentStep3() {
    const router = useRouter();
    const { activity, onPublishActivity } = useContext(ActivityContext);
    const { user: currentUser } = useContext(UserContext);
    const currentDate = useMemo(() => new Date(), []);
    const [isPublishing, setIsPublishing] = useState(false);
    if (!activity || activity.type !== 'libre') {
        return null;
    }

    const isFirstStepDone = (activity.data?.content || []).length > 0;
    const isSecondStepDone = !!activity.data?.title;

    const isValid = isFirstStepDone && isSecondStepDone;

    const onSubmit = async () => {
        setIsPublishing(true);
        try {
            await onPublishActivity();
            router.push('/contenu-libre/success');
        } catch (error) {
            // TODO: show error toast
            console.error(error);
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div style={{ padding: '16px 32px' }}>
            <Steps
                steps={[
                    { label: 'Contenu', href: '/contenu-libre/1', status: isFirstStepDone ? 'success' : 'warning' },
                    { label: 'Forme', href: '/contenu-libre/2', status: isSecondStepDone ? 'success' : 'warning' },
                    { label: 'Pré-visualiser', href: '/contenu-libre/3' },
                ]}
                activeStep={3}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                Pré-visualisez votre publication et publiez-la
            </Title>
            <p>Relisez votre publication une dernière fois avant de la publier !</p>
            <ActivityStepPreview
                stepName="Contenu"
                href="/contenu-libre/1"
                status={isFirstStepDone ? 'success' : 'warning'}
                style={{ margin: '16px 0' }}
            >
                <FreeContentView activity={activity} />
            </ActivityStepPreview>
            <ActivityStepPreview
                stepName="Forme"
                href="/contenu-libre/2"
                status={isSecondStepDone ? 'success' : 'warning'}
                style={{ margin: '16px 0' }}
            >
                <ActivityCard user={currentUser} activity={{ ...activity, publishDate: currentDate.toISOString() }} shouldHideButtons />
            </ActivityStepPreview>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '32px 0' }}>
                <Button as="a" href="/contenu-libre/2" color="primary" variant="outlined" label="Étape précédente" leftIcon={<ChevronLeftIcon />} />
                <Button color="primary" variant="contained" label="Publier" disabled={!isValid} onClick={onSubmit} />
            </div>
            {isPublishing && <Loader isLoading={isPublishing} />}
        </div>
    );
}
