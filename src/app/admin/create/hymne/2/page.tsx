'use client';

import { EditableTrack } from '@app/admin/create/hymne/EditableTrack/EditableTrack';
import { AnthemContext } from '@app/admin/create/hymne/anthemContext';
import { Button } from '@frontend/components/ui/Button';
import { Loader } from '@frontend/components/ui/Loader';
import { PageContainer } from '@frontend/components/ui/PageContainer/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { UploadSoundModal } from '@frontend/components/upload/UploadSoundModal';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import type { AnthemTrack } from '@server/database/schemas/activity-types';
import { useRouter } from 'next/navigation';
import React from 'react';

import AudioStructureImage from './audio.svg';

const EMPTY_TRACK: AnthemTrack = {
    name: '',
    iconUrl: '',
};

const formatDuration = (duration: number) => {
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default function Anthem2Page() {
    const router = useRouter();
    const { anthemActivity, setAnthemActivity, mixAudioFiles } = React.useContext(AnthemContext);

    const introTrack = anthemActivity.data.introTrack || EMPTY_TRACK;
    const setIntroTrack = React.useCallback(
        (newIntroTrack: AnthemTrack, soundDuration?: number) => {
            setAnthemActivity({
                ...anthemActivity,
                data: {
                    ...anthemActivity.data,
                    introTrack: newIntroTrack,
                    introDurationMs: !newIntroTrack.url ? undefined : soundDuration || anthemActivity.data.introDurationMs,
                },
            });
        },
        [anthemActivity, setAnthemActivity],
    );
    const outroTrack = anthemActivity.data.outroTrack || EMPTY_TRACK;
    const setOutroTrack = React.useCallback(
        (newOutroTrack: AnthemTrack, soundDuration?: number) => {
            setAnthemActivity({
                ...anthemActivity,
                data: {
                    ...anthemActivity.data,
                    outroTrack: newOutroTrack,
                    outroDurationMs: !newOutroTrack.url ? undefined : soundDuration || anthemActivity.data.outroDurationMs,
                },
            });
        },
        [anthemActivity, setAnthemActivity],
    );
    const [uploadModalTrackId, setUploadModalTrackId] = React.useState<'intro' | 'outro' | null>(null);
    const trackToEditForUpload = uploadModalTrackId === 'intro' ? introTrack : uploadModalTrackId === 'outro' ? outroTrack : undefined;

    const introDuration = anthemActivity.data.introDurationMs || 0;
    const coupletDuration = anthemActivity.data.verseDurationMs || 0;
    const outroDuration = anthemActivity.data.outroDurationMs || 0;

    const totalDuration = introDuration + coupletDuration + outroDuration;

    const [requestedAudioMix, setRequestedAudioMix] = React.useState<boolean>(false);
    const onNext = async (url: string) => {
        setRequestedAudioMix(true);
        await mixAudioFiles();
        setRequestedAudioMix(false);
        router.push(url);
    };

    const anthemVerseUrl = anthemActivity.data.anthemVerseAudioUrl;
    const isStep1Complete = Boolean(anthemVerseUrl);

    return (
        <PageContainer>
            <Steps
                steps={[
                    { label: 'Mix couplet', href: '/admin/create/hymne/1', status: isStep1Complete ? 'success' : 'warning' },
                    { label: 'Intro - Outro', href: '/admin/create/hymne/2' },
                    { label: 'Couplet', href: '/admin/create/hymne/3' },
                    { label: 'Refrain', href: '/admin/create/hymne/4' },
                    { label: 'Prévisualiser', href: '/admin/create/hymne/5' },
                ]}
                activeStep={2}
                onNavigateToLink={(event, url) => {
                    event.preventDefault();
                    onNext(url);
                }}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                Mettre en ligne les pistes sonores de l&apos;hymne
            </Title>
            <p>
                Pour mémoire voici la structure de l&apos;hymne (<strong>{formatDuration(totalDuration)}</strong>):
            </p>
            <div style={{ width: '100%', maxWidth: '800px', margin: '16px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                    <span>
                        Intro: <strong>{formatDuration(introDuration)}</strong>
                    </span>
                    <span>
                        Couplet: <strong>{formatDuration(coupletDuration)}</strong>
                    </span>
                    <span>
                        Outro: <strong>{formatDuration(outroDuration)}</strong>
                    </span>
                </div>
                <AudioStructureImage />
            </div>
            <p>Mettre en ligne le fichier son de l&apos;intro + refrain chanté :</p>
            <EditableTrack
                track={introTrack}
                onChange={setIntroTrack}
                onEditUrl={() => setUploadModalTrackId('intro')}
                onDelete={introTrack.url ? () => setIntroTrack({ ...introTrack, url: undefined }) : undefined}
                deleteTooltip="Supprimer le son"
                style={{ margin: '16px 0' }}
            />
            <p>Mettre en ligne le fichier son de l&apos;outro :</p>
            <EditableTrack
                track={outroTrack}
                onChange={setOutroTrack}
                onEditUrl={() => setUploadModalTrackId('outro')}
                onDelete={outroTrack.url ? () => setOutroTrack({ ...outroTrack, url: undefined }) : undefined}
                deleteTooltip="Supprimer le son"
                style={{ margin: '16px 0' }}
            />
            <UploadSoundModal
                isOpen={trackToEditForUpload !== undefined}
                initialSoundUrl={trackToEditForUpload?.url}
                onClose={() => setUploadModalTrackId(null)}
                onNewSound={(soundUrl, soundDuration) => {
                    if (uploadModalTrackId === 'intro') {
                        setIntroTrack({ ...introTrack, url: soundUrl }, soundDuration);
                    } else if (uploadModalTrackId === 'outro') {
                        setOutroTrack({ ...outroTrack, url: soundUrl }, soundDuration);
                    }
                    setUploadModalTrackId(null);
                }}
            />
            <Loader isLoading={requestedAudioMix} />
            <div style={{ textAlign: 'right', marginTop: '16px' }}>
                <Button
                    onClick={() => onNext('/admin/create/hymne/3')}
                    color="primary"
                    label="Étape suivante"
                    rightIcon={<ChevronRightIcon />}
                ></Button>
            </div>
        </PageContainer>
    );
}
