'use client';

import { Steps } from '@frontend/components/1Village/Steps';
import { Link } from '@frontend/components/navigation/Link';
import { Button } from '@frontend/components/ui/Button';
import { TextArea } from '@frontend/components/ui/Form';
import { Title } from '@frontend/components/ui/Title';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { useContext } from 'react';

import styles from './page.module.css';

interface FreeActivityContent {
    text: string;
    title: string;
    extract: string;
}
export const isFreeActivityContent = (content: unknown): content is FreeActivityContent => {
    return (
        typeof content === 'object' &&
        content !== null &&
        'text' in content &&
        typeof content.text === 'string' &&
        'title' in content &&
        typeof content.title === 'string' &&
        'extract' in content &&
        typeof content.extract === 'string'
    );
};

export default function FreeContentStep1() {
    const { activity, setActivity } = useContext(ActivityContext);
    if (!activity || activity.type !== 'libre') {
        return null;
    }

    const freeContent = isFreeActivityContent(activity.content) ? activity.content : { text: '', title: '', extract: '' };

    return (
        <div className={styles.page} style={{ padding: '16px 32px' }}>
            <Link href="/contenu-libre" className={styles.backButton}>
                <ChevronLeftIcon /> Retour
            </Link>
            <Steps
                steps={[
                    { label: 'Contenu', href: '/contenu-libre/1' },
                    { label: 'Forme', href: '/contenu-libre/2' },
                    { label: 'Pré-visualiser', href: '/contenu-libre/3' },
                ]}
                activeStep={1}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                Ecrivez le contenu de votre publication
            </Title>
            <p>
                Utilisez l&apos;éditeur de bloc pour définir le contenu de votre publication. Dans l&apos;étape 2 vous pourrez définir l&apos;aspect
                de la carte résumée de votre publication.
            </p>
            <div style={{ marginTop: '16px' }}>
                <TextArea
                    value={freeContent.text}
                    onChange={(e) =>
                        setActivity({
                            ...activity,
                            content: {
                                ...freeContent,
                                text: e.target.value,
                            },
                        })
                    }
                    color="secondary"
                    placeholder="Ecrivez le contenu de votre publication"
                />
                <div style={{ textAlign: 'right', marginTop: '16px' }}>
                    <Button as="a" href="/contenu-libre/2" color="primary" label="Étape suivante" rightIcon={<ChevronRightIcon />}></Button>
                </div>
            </div>
        </div>
    );
}
