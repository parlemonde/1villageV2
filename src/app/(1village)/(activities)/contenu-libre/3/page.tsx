'use client';

import { Steps } from '@frontend/components/1Village/Steps';
import { HtmlViewer } from '@frontend/components/html/HtmlViewer';
import { Button } from '@frontend/components/ui/Button';
import { Loader } from '@frontend/components/ui/Loader';
import { Title } from '@frontend/components/ui/Title';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { useRouter } from 'next/navigation';
import { useContext, useState } from 'react';

export default function FreeContentStep3() {
    const router = useRouter();
    const { activity, onPublishActivity } = useContext(ActivityContext);
    const [isPublishing, setIsPublishing] = useState(false);
    if (!activity || activity.type !== 'libre') {
        return null;
    }
    const content = activity.content || {
        title: '',
        resume: '',
    };

    const isFirstStepDone = content.text;
    const isSecondStepDone = content.title;

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
                Pré-visualisez votre publication
            </Title>
            <HtmlViewer content={content.text} />
            <div style={{ textAlign: 'center' }}>
                <Button color="primary" variant="contained" label="Publier" disabled={!isValid} onClick={onSubmit} />
            </div>
            {isPublishing && <Loader isLoading={isPublishing} />}
        </div>
    );
}
