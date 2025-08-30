'use client';

import { Steps } from '@frontend/components/1Village/Steps';
import { Button } from '@frontend/components/ui/Button';
import { Field, Input } from '@frontend/components/ui/Form';
import { Title } from '@frontend/components/ui/Title';
import { useCurrentActivity } from '@frontend/hooks/useCurrentActivity';
import { ChevronRightIcon } from '@radix-ui/react-icons';

import { isFreeActivityContent } from '../1/FreeContentStep1Form';

export default function FreeContentStep2() {
    const { activity, setActivity } = useCurrentActivity({ activityType: 'libre' });
    const freeContent = isFreeActivityContent(activity?.content) ? activity?.content : { text: '', title: '', extract: '' };
    return (
        <div style={{ padding: '16px 32px' }}>
            <Steps
                steps={[
                    { label: 'Contenu', href: '/contenu-libre/1', status: freeContent.text ? 'success' : 'warning' },
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
                        value={freeContent.title}
                        onChange={(e) => setActivity({ ...activity, content: { ...freeContent, title: e.target.value } })}
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
                        value={freeContent.extract}
                        onChange={(e) => setActivity({ ...activity, content: { ...freeContent, extract: e.target.value } })}
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
