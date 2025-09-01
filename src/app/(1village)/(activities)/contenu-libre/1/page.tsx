'use client';

import { Steps } from '@frontend/components/1Village/Steps';
import { HtmlEditor } from '@frontend/components/HtmlEditor';
import { Link } from '@frontend/components/navigation/Link';
import { Button } from '@frontend/components/ui/Button';
import { Title } from '@frontend/components/ui/Title';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
// import { Node } from 'prosemirror-model';
// import { DOMSerializer } from 'prosemirror-model';
// import { schema } from 'prosemirror-schema-basic';
import { useContext } from 'react';

import styles from './page.module.css';

// const serializer = DOMSerializer.fromSchema(schema);

// const toHtml = (content: unknown) => {
//     try {
//         const doc = Node.fromJSON(schema, content);
//         return serializer.serializeFragment(doc.content);
//     } catch (error) {
//         console.error(error);
//         return null;
//     }
// };

export default function FreeContentStep1() {
    const { activity, setActivity } = useContext(ActivityContext);
    if (!activity || activity.type !== 'libre') {
        return null;
    }
    const content = activity.content || {
        title: '',
        resume: '',
    };

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
                Écrivez le contenu de votre publication
            </Title>
            <p>
                Utilisez l&apos;éditeur de bloc pour définir le contenu de votre publication. Dans l&apos;étape 2 vous pourrez définir l&apos;aspect
                de la carte résumée de votre publication.
            </p>
            <div style={{ marginTop: '16px' }}>
                <HtmlEditor
                    content={content.text}
                    onChange={(text) => setActivity({ ...activity, content: { ...content, text } })}
                    color="secondary"
                    placeholder="Écrivez le contenu de votre publication"
                />
                <div style={{ textAlign: 'right', marginTop: '16px' }}>
                    <Button as="a" href="/contenu-libre/2" color="primary" label="Étape suivante" rightIcon={<ChevronRightIcon />}></Button>
                </div>
            </div>
        </div>
    );
}
