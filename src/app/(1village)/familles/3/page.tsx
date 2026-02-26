'use client';

import { downloadPdf } from '@app/(1village)/familles/helpers';
import { sendToast } from '@frontend/components/Toasts';
import { HtmlEditor } from '@frontend/components/html/HtmlEditor';
import type { HtmlEditorContent } from '@frontend/components/html/HtmlEditor/HtmlEditor';
import { Button } from '@frontend/components/ui/Button';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { FamilyContext } from '@frontend/contexts/familyContext';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { generateInvitationsPdf } from '@server-actions/families/generate-invitations-pdf';
import { useExtracted } from 'next-intl';
import { useContext } from 'react';

import styles from './page.module.css';

export const useDefaultParentInvitationMessage = () => {
    const t = useExtracted('app.(1village).familles.3');
    const DEFAULT_PARENT_INVITATION_MESSAGE: HtmlEditorContent = {
        type: 'doc',
        content: [
            {
                type: 'paragraph',
                attrs: {
                    align: 'left',
                },
                content: [
                    {
                        type: 'text',
                        text: t('Bonjour,'),
                    },
                ],
            },
            {
                type: 'paragraph',
                attrs: {
                    align: 'left',
                },
                content: [],
            },
            {
                type: 'paragraph',
                attrs: {
                    align: 'left',
                },
                content: [
                    {
                        type: 'text',
                        text: t(
                            'Notre classe participe au projet 1Village, de l’association Par Le Monde, agréée par le ministère de l’éducation nationale français. 1Village est un projet de correspondances avec d’autres classes du monde, accessible de façon sécurisée sur un site internet.',
                        ),
                    },
                ],
            },
            {
                type: 'paragraph',
                attrs: {
                    align: 'left',
                },
                content: [],
            },
            {
                type: 'paragraph',
                attrs: {
                    align: 'left',
                },
                content: [
                    {
                        type: 'text',
                        text: t('Si vous souhaitez accéder à ce site et observer les échanges en famille, il vous faut suivre cette démarche :'),
                    },
                ],
            },
            {
                type: 'paragraph',
                attrs: {
                    align: 'left',
                },
                content: [],
            },
            {
                type: 'paragraph',
                attrs: {
                    align: 'left',
                },
                content: [
                    {
                        type: 'text',
                        text: `    ${t('1. Créer un compte sur https://1v.parlemonde.org/inscription, en renseignant une adresse email et un mot de passe.')}`,
                    },
                ],
            },
            {
                type: 'paragraph',
                attrs: {
                    align: 'left',
                },
                content: [
                    {
                        type: 'text',
                        text: `    ${t('2. Confirmez votre adresse mail en cliquant sur le lien envoyé.')}`,
                    },
                ],
            },
            {
                type: 'paragraph',
                attrs: {
                    align: 'left',
                },
                content: [
                    {
                        type: 'text',
                        text: `    ${t('3. Connectez vous sur https://1v.parlemonde.org/inscription et rattachez votre compte à l’identifiant unique')} `,
                    },
                    {
                        type: 'text',
                        marks: [
                            {
                                type: 'bold',
                            },
                        ],
                        text: '%code',
                    },
                    {
                        type: 'text',
                        text: '.',
                    },
                ],
            },
            {
                type: 'paragraph',
                attrs: {
                    align: 'left',
                },
                content: [],
            },
            {
                type: 'paragraph',
                attrs: {
                    align: 'left',
                },
                content: [
                    {
                        type: 'text',
                        text: t(
                            'Jusqu’à 5 personnes de votre famille peuvent créer un compte et le rattacher à l’identifiant unique de votre enfant.',
                        ),
                    },
                ],
            },
            {
                type: 'paragraph',
                attrs: {
                    align: 'left',
                },
                content: [],
            },
            {
                type: 'paragraph',
                attrs: {
                    align: 'left',
                },
                content: [],
            },
            {
                type: 'paragraph',
                attrs: {
                    align: 'left',
                },
                content: [
                    {
                        type: 'text',
                        text: t('Bonne journée'),
                    },
                ],
            },
        ],
    };

    return DEFAULT_PARENT_INVITATION_MESSAGE;
};

export default function FamillesStep3() {
    const t = useExtracted('app.(1village).familles.3');
    const tCommon = useExtracted('common');

    const { form, setParentInvitationMessage } = useContext(FamilyContext);

    const print = async () => {
        const pdfBuffer = await generateInvitationsPdf(form.parentInvitationMessage);
        if (!pdfBuffer) {
            sendToast({ type: 'error', message: t('Une erreur est survenue lors de la génération du PDF') });
            return;
        }

        downloadPdf(pdfBuffer, t('code-enfants'));
    };

    return (
        <PageContainer>
            <Steps
                steps={[
                    { label: t('Visibilité'), href: '/familles/1', status: 'success' },
                    { label: t('Ajout enfants'), href: '/familles/2', status: 'success' },
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
                    'Attention à ne pas changer ou supprimer le "code enfant" <strong>%code</strong> qui se crée automatiquement pour chaque enfant.',
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
                <Button as="a" href="/familles/2" color="primary" label={tCommon('Étape précédente')} leftIcon={<ChevronLeftIcon />} />
                <Button as="a" href="/familles/4" color="primary" label={tCommon('Étape suivante')} rightIcon={<ChevronRightIcon />} />
            </div>
        </PageContainer>
    );
}
