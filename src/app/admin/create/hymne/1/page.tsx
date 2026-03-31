'use client';

import { EditableTrack } from '@app/admin/create/hymne/EditableTrack/EditableTrack';
import { AnthemContext } from '@app/admin/create/hymne/anthemContext';
import { BackButton } from '@frontend/components/activities/BackButton/BackButton';
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
import isEqual from 'react-fast-compare';
import { v4 as uuidv4 } from 'uuid';

const VOCAL_TRACK_ID = 'LaLa';

const verseTracksWithIds = (verseTracks: AnthemTrack[] = []): Array<AnthemTrack & { id: string }> => {
    return verseTracks.map((track) => ({ ...track, id: uuidv4() }));
};

const EMPTY_TRACK: AnthemTrack = {
    name: '',
};

export default function Anthem1Page() {
    const router = useRouter();
    const { anthemActivity, setAnthemActivity, mixAudioFiles } = React.useContext(AnthemContext);

    const vocalTrack = anthemActivity.data.vocalTrack || EMPTY_TRACK;
    const setVocalTrack = React.useCallback(
        (newVocalTrack: AnthemTrack, soundDuration?: number) => {
            setAnthemActivity({
                ...anthemActivity,
                data: {
                    ...anthemActivity.data,
                    vocalTrack: newVocalTrack,
                    vocalDurationMs: !newVocalTrack.url ? undefined : soundDuration || anthemActivity.data.vocalDurationMs,
                },
            });
        },
        [anthemActivity, setAnthemActivity],
    );
    const [verseTracks, _setVerseTracks] = React.useState<Array<AnthemTrack & { id: string }>>(verseTracksWithIds(anthemActivity.data.verseTracks));
    const setVerseTracks = React.useCallback(
        (newVerseTracks: Array<AnthemTrack & { id: string }>, soundDuration = 0) => {
            const newVerseTracksDuration = newVerseTracks.every((track) => !Boolean(track.url))
                ? 0
                : Math.max(soundDuration, anthemActivity.data.verseDurationMs || 0);
            _setVerseTracks(newVerseTracks);
            setAnthemActivity({
                ...anthemActivity,
                data: {
                    ...anthemActivity.data,
                    verseTracks: newVerseTracks.map(({ id, ...track }) => track),
                    verseDurationMs: newVerseTracksDuration === 0 ? undefined : newVerseTracksDuration,
                },
            });
        },
        [anthemActivity, setAnthemActivity],
    );
    const [uploadModalTrackId, setUploadModalTrackId] = React.useState<string | null>(null);
    const trackToEditForUpload = uploadModalTrackId === VOCAL_TRACK_ID ? vocalTrack : verseTracks.find((track) => track.id === uploadModalTrackId);
    const [requestedAudioMix, setRequestedAudioMix] = React.useState<boolean>(false);

    // If the anthem verse tracks have changed, update the state
    if (
        !isEqual(
            verseTracks.map(({ id, ...track }) => track),
            anthemActivity.data.verseTracks,
        )
    ) {
        setVerseTracks(verseTracksWithIds(anthemActivity.data.verseTracks));
    }

    const onNext = async (url: string) => {
        setRequestedAudioMix(true);
        await mixAudioFiles();
        setRequestedAudioMix(false);
        router.push(url);
    };

    return (
        <PageContainer>
            <BackButton href="/admin" label="Retour" />
            <Steps
                steps={[
                    { label: 'Mix couplet', href: '/admin/create/hymne/1' },
                    { label: 'Intro - Outro', href: '/admin/create/hymne/2' },
                    { label: 'Couplet', href: '/admin/create/hymne/3' },
                    { label: 'Refrain', href: '/admin/create/hymne/4' },
                    { label: 'Prévisualiser', href: '/admin/create/hymne/5' },
                ]}
                activeStep={1}
                marginTop="xl"
                marginBottom="md"
                onNavigateToLink={(event, url) => {
                    event.preventDefault();
                    onNext(url);
                }}
            />
            <Title variant="h2" marginBottom="md">
                Mettre en ligne les pistes sonores du couplet
            </Title>
            <p style={{ marginBottom: '16px' }}>Commencez le paramétrage en mettant en ligne les différentes pistes sonores du couplet :</p>
            <p>La piste versee du couplet, La La</p>
            <EditableTrack
                track={vocalTrack}
                onChange={setVocalTrack}
                onEditUrl={() => setUploadModalTrackId(VOCAL_TRACK_ID)}
                onDelete={vocalTrack.url ? () => setVocalTrack({ ...vocalTrack, url: undefined }) : undefined}
                deleteTooltip="Supprimer le son"
                style={vocalTrack.url ? { margin: '16px 0' } : { margin: '16px 40px 16px 0', maxWidth: '760px' }}
            />
            <p>Les différentes pistes sonores du couplet (utiles au mixage)</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '16px 0' }}>
                {verseTracks.map((track) => (
                    <EditableTrack
                        key={track.id}
                        track={track}
                        onChange={(updatedTrack) => setVerseTracks(verseTracks.map((t) => (t.id === track.id ? { ...updatedTrack, id: t.id } : t)))}
                        onEditUrl={() => setUploadModalTrackId(track.id)}
                        deleteTooltip={track.url ? 'Supprimer le son' : 'Supprimer la piste'}
                        onDelete={() => {
                            if (track.url) {
                                setVerseTracks(verseTracks.map((t) => (t.id === track.id ? { ...t, url: undefined } : t)));
                            } else {
                                setVerseTracks(verseTracks.filter((t) => t.id !== track.id));
                            }
                        }}
                    />
                ))}
            </div>
            <Button
                size="sm"
                label="Ajouter une piste"
                variant="contained"
                color="secondary"
                onClick={() => setVerseTracks([...verseTracks, { id: uuidv4(), name: `Piste sonore ${verseTracks.length + 1}` }])}
            />
            <UploadSoundModal
                isOpen={trackToEditForUpload !== undefined}
                initialSoundUrl={trackToEditForUpload?.url}
                onClose={() => setUploadModalTrackId(null)}
                onNewSound={(soundUrl, soundDuration) => {
                    if (uploadModalTrackId === VOCAL_TRACK_ID) {
                        setVocalTrack({ ...vocalTrack, url: soundUrl }, soundDuration);
                    } else if (uploadModalTrackId) {
                        setVerseTracks(
                            verseTracks.map((t) => (t.id === uploadModalTrackId ? { ...t, url: soundUrl } : t)),
                            soundDuration,
                        );
                    }
                    setUploadModalTrackId(null);
                }}
            />
            <Loader isLoading={requestedAudioMix} />
            <div style={{ textAlign: 'right', marginTop: '16px' }}>
                <Button
                    onClick={() => onNext('/admin/create/hymne/2')}
                    color="primary"
                    label="Étape suivante"
                    rightIcon={<ChevronRightIcon />}
                ></Button>
            </div>
        </PageContainer>
    );
}
