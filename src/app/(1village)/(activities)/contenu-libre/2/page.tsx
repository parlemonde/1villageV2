'use client';

import { Steps } from '@frontend/components/1Village/Steps';
import { Button } from '@frontend/components/ui/Button';
import { Field, Input } from '@frontend/components/ui/Form';
import { Title } from '@frontend/components/ui/Title';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import { useContext } from 'react';

export default function FreeContentStep2() {
    const { activity, setActivity } = useContext(ActivityContext);
    if (!activity || activity.type !== 'libre') {
        return null;
    }
    const content = activity.content || {
        text: '',
        title: '',
        extract: '',
    };

    return (
        <div style={{ padding: '16px 32px' }}>
            <Steps
                steps={[
                    { label: 'Contenu', href: '/contenu-libre/1', status: content.text ? 'success' : 'warning' },
                    { label: 'Forme', href: '/contenu-libre/2' },
                    { label: 'Pré-visualiser', href: '/contenu-libre/3' },
                ]}
                activeStep={2}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                Ajustez l&apos;apparence de votre publication
            </Title>
            <Field
                label="Titre"
                name="title"
                input={
                    <Input
                        id="title"
                        name="title"
                        isFullWidth
                        placeholder="Entrez le titre de votre publication"
                        value={content.title}
                        onChange={(e) => setActivity({ ...activity, content: { ...content, title: e.target.value } })}
                    />
                }
                marginBottom="md"
            />
            <Field
                label="Extrait"
                name="extract"
                input={
                    <Input
                        id="extract"
                        name="extract"
                        isFullWidth
                        placeholder="Entrez l'extrait de votre publication"
                        value={content.extract}
                        onChange={(e) => setActivity({ ...activity, content: { ...content, extract: e.target.value } })}
                    />
                }
                marginBottom="md"
            />
            <div style={{ textAlign: 'right' }}>
                <Button as="a" href="/contenu-libre/3" color="primary" label="Étape suivante" rightIcon={<ChevronRightIcon />}></Button>
            </div>
        </div>
    );
}
