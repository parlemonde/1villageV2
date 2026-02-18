'use client';

import { Button } from '@frontend/components/ui/Button';
import { Input } from '@frontend/components/ui/Form';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { useExtracted } from 'next-intl';

import styles from './page.module.css';

export default function FamillesStep2() {
    const t = useExtracted('app.(1village).familles.2');
    const tCommon = useExtracted('common');

    const addChild = () => {
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
                activeStep={2}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                <p>{t('Ajoutez les enfants de votre classe')}</p>
            </Title>
            <p>{t('Chaque enfant possède un "code enfant" qui permet à 5 membres de sa famille de se créer un compte.')}</p>
            <br />
            <p>{t("Vous devez ajouter autant d'enfants qu'il y a dans votre classe (vous pouvez ajouter des enfants en cours d'années !):")}</p>
            <div className={styles.addChild}>
                <Input type="text" placeholder={t('Prénom')} />
                <Input type="text" placeholder={t('Nom')} />
                <Button onClick={addChild} color="primary" label={t('Ajouter un enfant')} />
            </div>
            <div className={styles.buttonsContainer}>
                <Button as="a" href="/familles/1" color="primary" label={tCommon('Étape précédente')} rightIcon={<ChevronLeftIcon />} />
                <Button as="a" href="/familles/3" color="primary" label={tCommon('Étape suivante')} rightIcon={<ChevronRightIcon />} />
            </div>
        </PageContainer>
    );
}
