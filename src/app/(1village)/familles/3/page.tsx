'use client';

import { HtmlEditor } from '@frontend/components/html/HtmlEditor';
import { Button } from '@frontend/components/ui/Button';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { FamilyContext } from '@frontend/contexts/familyContext';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { generateAllInvitationsPdf } from '@server-actions/families/generate-all-invitations-pdf';
import { useExtracted } from 'next-intl';
import { useContext } from 'react';

import styles from './page.module.css';

export default function FamillesStep3() {
    const t = useExtracted('app.(1village).familles.3');
    const tCommon = useExtracted('common');

    const { form, setParentInvitationMessage } = useContext(FamilyContext);

    const print = () => {
        const pdf = await generateAllInvitationsPdf(form.parentInvitationMessage);
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
            <Title variant="h2" marginBottom="md">
                {t('Communiquez les identifiants aux familles')}
            </Title>
            <p>{t('Voici un modèle de texte de présentation à partager aux familles. Vous pouvez le modifier et le traduire librement !')}</p>
            <br />
            <p className={styles.mb8}>
                {t.rich(
                    'Attention à ne pas changer ou supprimer le "code enfant" <strong>%inviteCode</strong> qui se crée automatiquement pour chaque enfant.',
                    {
                        strong: (chunks) => <strong>{chunks}</strong>,
                    },
                )}
            </p>
            <HtmlEditor content={form.parentInvitationMessage} onChange={setParentInvitationMessage} />
            <div className={styles.printButtonContainer}>
                <Button label={t('Imprimer')} color="secondary" variant="contained" onClick={print} />
            </div>
            <div className={styles.buttonsContainer}>
                <Button as="a" href="/familles/1" color="primary" label={tCommon('Étape précédente')} leftIcon={<ChevronLeftIcon />} />
                <Button as="a" href="/familles/3" color="primary" label={tCommon('Étape suivante')} rightIcon={<ChevronRightIcon />} />
            </div>
        </PageContainer>
    );
}
