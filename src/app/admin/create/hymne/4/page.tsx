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

export default function Anthem4Page() {
    const { anthemActivity, setAnthemActivity } = React.useContext(AnthemContext);
    const chorusSyllables = anthemActivity.data.chorusSyllables || [];
    const setChorusSyllables = React.useCallback(
        (newChorusSyllables: string[][]) => {
            setAnthemActivity({ ...anthemActivity, data: { ...anthemActivity.data, chorusSyllables: newChorusSyllables } });
        },
        [anthemActivity, setAnthemActivity],
    );

    const anthemVerseUrl = anthemActivity.data.anthemVerseAudioUrl;
    const anthemFullUrl = anthemActivity.data.anthemFullAudioUrl;
    const verseSyllables = anthemActivity.data.verseSyllables || [];
    const isStep1Complete = Boolean(anthemVerseUrl);
    const isStep2Complete = Boolean(anthemFullUrl);
    const isStep3Complete = Boolean(verseSyllables.length > 0);

    return (
        <PageContainer>
            <Steps
                steps={[
                    { label: 'Mix couplet', href: '/admin/create/hymne/1', status: isStep1Complete ? 'success' : 'warning' },
                    { label: 'Intro - Outro', href: '/admin/create/hymne/2', status: isStep2Complete ? 'success' : 'warning' },
                    { label: 'Couplet', href: '/admin/create/hymne/3', status: isStep3Complete ? 'success' : 'warning' },
                    { label: 'Refrain', href: '/admin/create/hymne/4' },
                    { label: 'Prévisualiser', href: '/admin/create/hymne/5' },
                ]}
                activeStep={4}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                Paramétrer le refrain
            </Title>
            <p>
                Rajouter des syllabes au refrain, soit sur la même ligne, soit en passant à la ligne. Puis remplacez les &quot;La&quot; par les
                syllabes du refrain.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '16px 0' }}>
                {chorusSyllables.map((syllable, lineIndex) => (
                    <div key={lineIndex} style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
                        {syllable.map((syllable, syllableIndex) => (
                            <Syllable
                                key={`${lineIndex}-${syllableIndex}`}
                                syllable={syllable}
                                onChange={(syllable) =>
                                    setChorusSyllables(
                                        chorusSyllables.map((line, index) =>
                                            index === lineIndex ? line.map((s, i) => (i === syllableIndex ? syllable : s)) : line,
                                        ),
                                    )
                                }
                                onDelete={() =>
                                    setChorusSyllables(
                                        chorusSyllables
                                            .map((line, index) => (index === lineIndex ? line.filter((_, i) => i !== syllableIndex) : line))
                                            .filter((line) => line.length > 0),
                                    )
                                }
                            />
                        ))}
                        {lineIndex < chorusSyllables.length - 1 && <SyllableReturn />}
                    </div>
                ))}
            </div>
            <AddSyllableCard syllables={chorusSyllables} setSyllables={setChorusSyllables} />
            <div style={{ textAlign: 'right', marginTop: '16px' }}>
                <Button as="a" href="/admin/create/hymne/5" color="primary" label="Étape suivante" rightIcon={<ChevronRightIcon />}></Button>
            </div>
        </PageContainer>
    );
}
