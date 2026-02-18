'use client';

import { HtmlEditor } from '@frontend/components/html/HtmlEditor';
import { Button } from '@frontend/components/ui/Button';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { useExtracted } from 'next-intl';
import { useState } from 'react';

import styles from './page.module.css';

export default function FamillesStep3() {
    const t = useExtracted('app.(1village).familles.3');
    const tCommon = useExtracted('common');

    const [content, setContent] = useState<unknown>();

    const print = () => {
        // TODO
    };

    return (
        <PageContainer>
            <Steps
                steps={[
                    { label: t('Visibilité'), href: '/familles/1' },
                    { label: t('Ajout enfants'), href: '/familles/2' },
                    { label: t('Communication'), href: '/familles/3' },
                    { label: t('Gestion'), href: '/familles/4' },
                ]}
                activeStep={3}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2">{t('Communiquez les identifiants aux familles')}</Title>
            <p>{t('Voici un modèle de texte de présentation à partager aux familles. Vous pouvez le modifier et le traduire librement !')}</p>
            <br />
            <p>
                {t.rich(
                    'Attention à ne pas changer ou supprimer le "code enfant" <strong>%code</strong> qui se crée automatiquement pour chaque enfant.',
                    {
                        strong: (chunks) => <strong>{chunks}</strong>,
                    },
                )}
            </p>
            <HtmlEditor content={content} onChange={setContent} />
            <div className={styles.printButtonContainer}>
                <Button label={t('Imprimer')} color="secondary" variant="contained" onClick={print} />
            </div>
            <div className={styles.buttonsContainer}>
                <Button as="a" href="/familles/1" color="primary" label={tCommon('Étape précédente')} rightIcon={<ChevronLeftIcon />} />
                <Button as="a" href="/familles/3" color="primary" label={tCommon('Étape suivante')} rightIcon={<ChevronRightIcon />} />
            </div>
        </PageContainer>
    );
}
