'use client';

import { AddSyllableCard } from '@app/admin/create/hymne/AddSyllableCard/AddSyllableCard';
import { Syllable, SyllableReturn } from '@app/admin/create/hymne/Syllable/Syllable';
import { AnthemContext } from '@app/admin/create/hymne/anthemContext';
import { Button } from '@frontend/components/ui/Button';
import { PageContainer } from '@frontend/components/ui/PageContainer/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import React from 'react';

export default function Anthem3Page() {
    const { anthemActivity, setAnthemActivity } = React.useContext(AnthemContext);
    const verseSyllables = anthemActivity.data.verseSyllables || [];
    const setVerseSyllables = React.useCallback(
        (newVerseSyllables: string[][]) => {
            setAnthemActivity({ ...anthemActivity, data: { ...anthemActivity.data, verseSyllables: newVerseSyllables } });
        },
        [anthemActivity, setAnthemActivity],
    );

    const anthemVerseUrl = anthemActivity.data.anthemVerseAudioUrl;
    const anthemFullUrl = anthemActivity.data.anthemFullAudioUrl;
    const isStep1Complete = Boolean(anthemVerseUrl);
    const isStep2Complete = Boolean(anthemFullUrl);

    return (
        <PageContainer>
            <Steps
                steps={[
                    { label: 'Mix couplet', href: '/admin/create/hymne/1', status: isStep1Complete ? 'success' : 'warning' },
                    { label: 'Intro - Outro', href: '/admin/create/hymne/2', status: isStep2Complete ? 'success' : 'warning' },
                    { label: 'Couplet', href: '/admin/create/hymne/3' },
                    { label: 'Refrain', href: '/admin/create/hymne/4' },
                    { label: 'Prévisualiser', href: '/admin/create/hymne/5' },
                ]}
                activeStep={3}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                Paramétrer le couplet
            </Title>
            <p>Rajouter des syllabes au couplet, soit sur la même ligne, soit en passant à la ligne.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '16px 0' }}>
                {verseSyllables.map((syllable, lineIndex) => (
                    <div key={lineIndex} style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
                        {syllable.map((syllable, syllableIndex) => (
                            <Syllable
                                key={`${lineIndex}-${syllableIndex}`}
                                syllable={syllable}
                                onDelete={() =>
                                    setVerseSyllables(
                                        verseSyllables
                                            .map((line, index) => (index === lineIndex ? line.filter((_, i) => i !== syllableIndex) : line))
                                            .filter((line) => line.length > 0),
                                    )
                                }
                            />
                        ))}
                        {lineIndex < verseSyllables.length - 1 && <SyllableReturn />}
                    </div>
                ))}
            </div>
            <AddSyllableCard syllables={verseSyllables} setSyllables={setVerseSyllables} />
            <div style={{ textAlign: 'right', marginTop: '16px' }}>
                <Button as="a" href="/admin/create/hymne/4" color="primary" label="Étape suivante" rightIcon={<ChevronRightIcon />}></Button>
            </div>
        </PageContainer>
    );
}
