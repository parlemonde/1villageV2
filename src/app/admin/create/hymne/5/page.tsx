'use client';

import { AnthemContext } from '@app/admin/create/hymne/anthemContext';
import { AudioMixPlayer } from '@frontend/components/AudioMixPlayer/AudioMixPlayer';
import { sendToast } from '@frontend/components/Toasts';
import { ActivityStepPreview } from '@frontend/components/activities/ActivityStepPreview';
import { Button } from '@frontend/components/ui/Button';
import { Loader } from '@frontend/components/ui/Loader';
import { PageContainer } from '@frontend/components/ui/PageContainer/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { publishActivity } from '@server-actions/activities/publish-activity';
import React from 'react';

export default function Anthem5Page() {
    const { anthemActivity, activityId } = React.useContext(AnthemContext);
    const verseTracks = anthemActivity.data.verseTracks || [];
    const anthemVerseUrl = anthemActivity.data.anthemVerseAudioUrl;
    const anthemFullUrl = anthemActivity.data.anthemFullAudioUrl;
    const verseSyllables = anthemActivity.data.verseSyllables || [];
    const chorusSyllables = anthemActivity.data.chorusSyllables || [];

    const [isSaving, setIsSaving] = React.useState(false);
    const onSave = async () => {
        setIsSaving(true);
        try {
            await publishActivity({ id: activityId, type: 'hymne', phase: 3, data: anthemActivity.data, isPelico: true });
            sendToast({
                message: "L'hymne a été enregistré avec succès",
                type: 'success',
            });
        } catch {
            sendToast({
                message: "Une erreur est survenue lors de l'enregistrement de l'hymne",
                type: 'error',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const isStep1Complete = Boolean(anthemVerseUrl);
    const isStep2Complete = Boolean(anthemFullUrl);
    const isStep3Complete = Boolean(verseSyllables.length > 0);
    const isStep4Complete = Boolean(chorusSyllables.length > 0);

    return (
        <PageContainer>
            <Steps
                steps={[
                    { label: 'Mix couplet', href: '/admin/create/hymne/1', status: isStep1Complete ? 'success' : 'warning' },
                    { label: 'Intro - Outro', href: '/admin/create/hymne/2', status: isStep2Complete ? 'success' : 'warning' },
                    { label: 'Couplet', href: '/admin/create/hymne/3', status: isStep3Complete ? 'success' : 'warning' },
                    { label: 'Refrain', href: '/admin/create/hymne/4', status: isStep4Complete ? 'success' : 'warning' },
                    { label: 'Prévisualiser', href: '/admin/create/hymne/5' },
                ]}
                activeStep={5}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                Prévisualiser l&apos;hymne
            </Title>
            <p>
                Voici la pré-visualisation de votre paramétrage. Vous pouvez la modifier à l&apos;étape précédente, et enregistrer vos changements
                ici.
            </p>
            <ActivityStepPreview
                stepName="Couplet"
                href="/admin/create/hymne/1"
                status={isStep1Complete ? 'success' : 'warning'}
                style={{ margin: '16px 0' }}
            >
                <span>Écoutez le mix par défaut du couplet (les {verseTracks.length} pistes mélangées):</span>
                <br />
                <br />
                <AudioMixPlayer src={anthemVerseUrl} />
            </ActivityStepPreview>
            <ActivityStepPreview
                stepName="Hymne entier"
                href="/admin/create/hymne/2"
                status={isStep2Complete ? 'success' : 'warning'}
                style={{ margin: '16px 0' }}
            >
                <span>Écoutez le mix de l&apos;hymne (intro + refrain + couplet mixé + outro):</span>
                <br />
                <br />
                <AudioMixPlayer src={anthemFullUrl} />
            </ActivityStepPreview>
            <ActivityStepPreview
                stepName="Syllabes du couplet"
                href="/admin/create/hymne/3"
                status={isStep3Complete ? 'success' : 'warning'}
                style={{ margin: '16px 0' }}
            >
                <span>Voilà la structure du couplet, découpé en syllabes :</span>
                <br />
                <br />
                {verseSyllables.map((syllable, index) => (
                    <div key={index}>
                        <span>{syllable.join(' ')}</span>
                    </div>
                ))}
            </ActivityStepPreview>
            <ActivityStepPreview
                stepName="Syllabes du refrain"
                href="/admin/create/hymne/4"
                status={isStep4Complete ? 'success' : 'warning'}
                style={{ margin: '16px 0' }}
            >
                <span>Voilà le refrain, découpé en syllabes :</span>
                <br />
                <br />
                {chorusSyllables.map((syllable, index) => (
                    <div key={index}>
                        <span>{syllable.join(' ')}</span>
                    </div>
                ))}
            </ActivityStepPreview>
            <Loader isLoading={isSaving} />
            <div style={{ textAlign: 'right', margin: '16px 0' }}>
                <Button color="primary" variant="outlined" label="Enregistrer les changements" onClick={onSave}></Button>
            </div>
        </PageContainer>
    );
}
